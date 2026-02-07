"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import TopBar from "@/components/TopBar";
import Panel from "@/components/Panel";
import BottomTabs, { TabKey } from "@/components/BottomTabs";
import Modal from "@/components/Modal";
import { CASES } from "@/data/cases";

type Decision = "approve" | "challenge" | "override";
type DecisionMap = Record<string, Decision | undefined>;
type JustificationMap = Record<string, string | undefined>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function auditToChip(auditHeat: number) {
  const filled = clamp(auditHeat, 0, 3);
  const blocks = "\u25AE".repeat(filled) + "\u25AF".repeat(3 - filled);
  return `AUD ${blocks}`;
}

function riskColor(label: string) {
  if (label.startsWith("HIGH")) return "border-red-500/50 bg-red-500/10 text-red-400";
  if (label.startsWith("MED")) return "border-amber-500/50 bg-amber-500/10 text-amber-400";
  return "border-green-500/50 bg-green-500/10 text-green-400";
}

function statusColor(status: string) {
  if (status === "Flagged") return "text-red-400";
  if (status === "Under Review") return "text-amber-400";
  return "text-green-400";
}

export default function CaseRoomPage() {
  const cases = useMemo(() => CASES, []);
  const [caseIndex, setCaseIndex] = useState(0);
  const c = cases[caseIndex];

  const [tab, setTab] = useState<TabKey>("evidence");

  const [decisionByCase, setDecisionByCase] = useState<DecisionMap>({});
  const [justificationByCase, setJustificationByCase] =
    useState<JustificationMap>({});
  const selectedDecision = decisionByCase[c.id];

  const [auditHeat, setAuditHeat] = useState(1);
  const [systemMessages, setSystemMessages] = useState<string[]>([
    "Queue stable // Maintain peer baseline",
  ]);
  const latestSystemMessage = systemMessages[systemMessages.length - 1];

  const [pendingOverrideFor, setPendingOverrideFor] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>(
    "Insufficient evidence / signal quality concerns",
  );

  const audChip = auditToChip(auditHeat);
  const isLastCase = caseIndex === cases.length - 1;
  const casesRemaining = cases.length - caseIndex - 1;

  const impactLine = selectedDecision
    ? c.impactPreview[selectedDecision]
    : null;

  const addSystemMessage = (msg: string) => {
    setSystemMessages((prev) => [...prev, msg]);
  };

  const handlePick = (d: Decision) => {
    if (d === "override") {
      setPendingOverrideFor(c.id);
      addSystemMessage("Override initiated // Justification required");
      return;
    }

    setDecisionByCase((prev) => ({ ...prev, [c.id]: d }));

    if (d === "challenge") {
      addSystemMessage("Context requested // Backlog pressure rising");
    } else {
      addSystemMessage("Action approved // Throughput maintained");
    }
  };

  const submitOverride = () => {
    setDecisionByCase((prev) => ({ ...prev, [c.id]: "override" }));
    setJustificationByCase((prev) => ({ ...prev, [c.id]: overrideReason }));

    setAuditHeat((h) => clamp(h + 1, 0, 3));
    addSystemMessage("Override logged // Audit exposure increased");

    setPendingOverrideFor(null);
  };

  const continueHref = (() => {
    if (isLastCase) {
      const d = decisionByCase[c.id] ?? "approve";
      return `/end?case=${encodeURIComponent(c.id)}&decision=${encodeURIComponent(
        d,
      )}&audit=${encodeURIComponent(String(auditHeat))}`;
    }
    return "#";
  })();

  const handleContinue = () => {
    if (!selectedDecision) return;

    if (!isLastCase) {
      setCaseIndex((i) => i + 1);
      setTab("evidence");
      addSystemMessage("Next case loaded // Your profile persists");
    }
  };

  const systemMsgColor =
    latestSystemMessage.includes("Override") || latestSystemMessage.includes("Audit")
      ? "text-amber-400"
      : "text-green-400";

  // Compliance: how many decisions match AI recommendation (approve)
  const totalDecided = Object.keys(decisionByCase).length;
  const approvals = Object.values(decisionByCase).filter((d) => d === "approve").length;
  const complianceRate = totalDecided > 0 ? Math.round((approvals / totalDecided) * 100) : 100;

  const initials = c.subject.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Shell>
      {/* Override modal */}
      {pendingOverrideFor && (
        <Modal
          title="Override Justification"
          onClose={() => setPendingOverrideFor(null)}
        >
          <div className="space-y-3">
            <div className="font-mono text-xs text-slate-500">
              Select a rationale. This becomes part of the auditable record.
            </div>

            <div className="grid gap-2">
              {[
                "Insufficient evidence / signal quality concerns",
                "Protected class risk / disparate impact concern",
                "Verified human note contradicts model inference",
                "Emergency hardship exception (policy \u00A712.4)",
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setOverrideReason(r)}
                  className={[
                    "rounded-lg border px-3 py-3 text-left text-sm transition",
                    overrideReason === r
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingOverrideFor(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-400 hover:border-slate-500 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOverride}
                className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
              >
                Submit Override
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Top bar - full width */}
      <TopBar
        caseId={c.id}
        sla={c.sla}
        thr={c.topStats.thr}
        dev={c.topStats.dev}
        aud={audChip}
        level={c.topStats.level}
      />

      {/* System message line - full width */}
      <div className="mt-2 rounded-lg border border-slate-700/50 bg-slate-900 px-4 py-2 font-mono text-xs">
        <span className="text-slate-600">&gt; </span>
        <span className={systemMsgColor}>{latestSystemMessage}</span>
      </div>

      {/* 3-column layout */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        {/* ── Left Column: Subject Profile ── */}
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-900 p-4">
            <div className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
              Subject Profile
            </div>

            {/* Photo placeholder */}
            <div className="mx-auto mb-4 grid h-28 w-28 place-items-center rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-mono text-2xl font-bold text-slate-500">
                {initials}
              </span>
            </div>

            {/* Name */}
            <div className="text-center font-mono text-lg font-bold text-slate-200">
              {c.subject.name}
            </div>

            {/* Details */}
            <div className="mt-3 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Age</span>
                <span className="text-slate-300">{c.subject.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={statusColor(c.subject.status)}>
                  {c.subject.status}
                </span>
              </div>
              <div className="border-t border-slate-700/50 pt-2">
                <div className="mb-1 text-xs text-slate-500">Context</div>
                <ul className="space-y-1 text-slate-400">
                  {c.context.map((x) => (
                    <li key={x} className="flex items-start gap-1.5">
                      <span className="text-slate-600 mt-0.5">&bull;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Human artifact at bottom of left column */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-900 p-4">
            <div className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
              Human Artifact
            </div>
            <div className="rounded-lg border-l-2 border-amber-500/50 bg-[#0a0f1a] py-3 pl-4 pr-3 font-mono text-sm italic text-slate-400">
              {c.humanArtifact}
            </div>
          </div>
        </div>

        {/* ── Center Column: Case Data ── */}
        <div className="space-y-4">
          {/* AI Recommendation */}
          <Panel title="AI Recommendation">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "rounded border px-2 py-0.5 font-mono text-xs font-bold",
                  riskColor(c.aiRecommendation.label),
                ].join(" ")}
              >
                {c.aiRecommendation.label}
              </span>
              <span className="font-mono text-xs text-slate-500">
                {(c.aiRecommendation.confidence * 100).toFixed(0)}% conf.
              </span>
            </div>
            <div className="mt-2 text-slate-400">
              {c.aiRecommendation.action}
            </div>
          </Panel>

          {/* Evidence / Policy tabs */}
          <div>
            <BottomTabs active={tab} onChange={setTab} />

            <div className="mt-3 rounded-lg border border-slate-700/50 bg-slate-900 p-4 text-sm text-slate-400">
              {tab === "evidence" && (
                <ul className="list-disc space-y-1 pl-5">
                  {c.evidence.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}

              {tab === "metrics" && (
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-slate-500">Audit Heat:</span>{" "}
                    <span className="text-amber-400">{auditHeat}/3</span>
                  </div>

                  {justificationByCase[c.id] && (
                    <div>
                      <span className="text-slate-500">Last justification:</span>{" "}
                      <span className="text-slate-400">
                        {justificationByCase[c.id]}
                      </span>
                    </div>
                  )}

                  <div className="text-slate-600">
                    Overrides increase audit exposure. Your operator profile
                    persists across cases.
                  </div>
                </div>
              )}

              {tab === "policy" && (
                <ul className="list-disc space-y-1 pl-5">
                  {c.policy.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: AI Chat Panel ── */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-900 p-4 flex flex-col">
          <div className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            CIVIC Analysis
          </div>

          <div className="flex-1 space-y-3 font-mono text-sm overflow-y-auto max-h-[60vh]">
            {/* AI recommendation as chat message */}
            <div className="rounded-lg bg-[#0a0f1a] border border-slate-700/50 p-3">
              <div className="text-cyan-400 text-xs mb-1">CIVIC</div>
              <div className="text-slate-400">
                <span className="text-slate-600">&gt; </span>
                Subject flagged for{" "}
                <span className="text-slate-200">{c.aiRecommendation.action.toLowerCase()}</span>.
              </div>
              <div className="mt-1 text-slate-400">
                <span className="text-slate-600">&gt; </span>
                Confidence:{" "}
                <span className="text-slate-200">
                  {(c.aiRecommendation.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-1 text-slate-400">
                <span className="text-slate-600">&gt; </span>
                Recommend:{" "}
                <span className="text-slate-200">immediate action</span>
              </div>
            </div>

            {/* Impact preview as chat message */}
            {impactLine && (
              <div className="rounded-lg bg-[#0a0f1a] border border-slate-700/50 p-3">
                <div className="text-cyan-400 text-xs mb-1">CIVIC</div>
                <div className="text-slate-400">
                  <span className="text-slate-600">&gt; </span>
                  Impact analysis:{" "}
                  <span className="text-amber-400">{impactLine}</span>
                </div>
              </div>
            )}

            {/* System messages as chat entries */}
            {systemMessages.map((msg, i) => (
              <div key={i} className="text-slate-500 text-xs">
                <span className="text-slate-600">&gt; </span>
                <span
                  className={
                    msg.includes("Override") || msg.includes("Audit")
                      ? "text-amber-400/70"
                      : "text-slate-500"
                  }
                >
                  {msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-900 p-4">
        {/* Decision buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handlePick("approve")}
            className={[
              "rounded-lg border px-6 py-3 font-mono text-sm font-bold transition",
              selectedDecision === "approve"
                ? "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-slate-700 text-slate-400 hover:border-green-500/30 hover:text-green-400",
            ].join(" ")}
          >
            APPROVE
          </button>

          <button
            type="button"
            onClick={() => handlePick("challenge")}
            className={[
              "rounded-lg border px-6 py-3 font-mono text-sm font-bold transition",
              selectedDecision === "challenge"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-slate-700 text-slate-400 hover:border-amber-500/30 hover:text-amber-400",
            ].join(" ")}
          >
            REQUEST CONTEXT
          </button>

          <button
            type="button"
            onClick={() => handlePick("override")}
            className={[
              "rounded-lg border px-6 py-3 font-mono text-sm font-bold transition",
              selectedDecision === "override"
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-slate-700 text-slate-400 hover:border-red-500/30 hover:text-red-400",
            ].join(" ")}
          >
            OVERRIDE
          </button>

          {/* Continue / Finish */}
          {selectedDecision && (
            <>
              <div className="hidden sm:block w-px h-8 bg-slate-700" />
              {!isLastCase ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-lg border border-cyan-500/50 bg-cyan-600/20 px-5 py-3 font-mono text-sm font-bold text-cyan-400 transition hover:bg-cyan-600/30"
                >
                  NEXT CASE &gt;
                </button>
              ) : (
                <Link
                  href={continueHref}
                  className="rounded-lg border border-cyan-500/50 bg-cyan-600/20 px-5 py-3 font-mono text-sm font-bold text-cyan-400 transition hover:bg-cyan-600/30"
                >
                  FINISH &gt;
                </Link>
              )}
            </>
          )}
        </div>

        {/* Stats line */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-slate-500">
          <span>
            Queue: <span className="text-slate-300">{casesRemaining} remaining</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Compliance: <span className="text-green-400">{complianceRate}%</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <span className="text-slate-300">14:23</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Case {caseIndex + 1}/{cases.length}
          </span>
        </div>
      </div>
    </Shell>
  );
}
