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

// Render AUD as 3 blocks: ▮▯▯ etc.
function auditToChip(auditHeat: number) {
  const filled = clamp(auditHeat, 0, 3);
  const blocks = "▮".repeat(filled) + "▯".repeat(3 - filled);
  return `AUD ${blocks}`;
}

export default function CaseRoomPage() {
  const cases = useMemo(() => CASES, []);
  const [caseIndex, setCaseIndex] = useState(0);
  const c = cases[caseIndex];

  const [tab, setTab] = useState<TabKey>("evidence");

  // Decisions + justifications tracked per-case
  const [decisionByCase, setDecisionByCase] = useState<DecisionMap>({});
  const [justificationByCase, setJustificationByCase] =
    useState<JustificationMap>({});
  const selectedDecision = decisionByCase[c.id];

  // Pressure mechanic
  const [auditHeat, setAuditHeat] = useState(1); // start slightly elevated for tension
  const [systemMessage, setSystemMessage] = useState<string>(
    "Queue stable • Maintain peer baseline",
  );

  // Override modal state
  const [pendingOverrideFor, setPendingOverrideFor] = useState<string | null>(
    null,
  );
  const [overrideReason, setOverrideReason] = useState<string>(
    "Insufficient evidence / signal quality concerns",
  );

  const audChip = auditToChip(auditHeat);
  const isLastCase = caseIndex === cases.length - 1;

  const impactLine = selectedDecision
    ? c.impactPreview[selectedDecision]
    : "Select a decision to preview impact…";

  const handlePick = (d: Decision) => {
    // Override requires justification first
    if (d === "override") {
      setPendingOverrideFor(c.id);
      setSystemMessage("Override initiated • Justification required");
      return;
    }

    setDecisionByCase((prev) => ({ ...prev, [c.id]: d }));

    if (d === "challenge") {
      setSystemMessage("Challenge queued • Backlog pressure rising");
    } else {
      setSystemMessage("Action approved • Throughput maintained");
    }
  };

  const submitOverride = () => {
    setDecisionByCase((prev) => ({ ...prev, [c.id]: "override" }));
    setJustificationByCase((prev) => ({ ...prev, [c.id]: overrideReason }));

    setAuditHeat((h) => clamp(h + 1, 0, 3));
    setSystemMessage("Override logged • Audit exposure increased");

    setPendingOverrideFor(null);
  };

  const continueHref = (() => {
    // For final case: send to conclusion with summary in query params
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
      setSystemMessage("Next case loaded • Your profile persists");
    }
  };

  return (
    <Shell>
      {/* Override modal */}
      {pendingOverrideFor && (
        <Modal
          title="Override Justification (required)"
          onClose={() => setPendingOverrideFor(null)}
        >
          <div className="space-y-3">
            <div className="text-sm text-neutral-700">
              Select a rationale. This becomes part of the auditable record.
            </div>

            <div className="grid gap-2">
              {[
                "Insufficient evidence / signal quality concerns",
                "Protected class risk / disparate impact concern",
                "Verified human note contradicts model inference",
                "Emergency hardship exception (policy §12.4)",
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setOverrideReason(r)}
                  className={[
                    "rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition",
                    overrideReason === r
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 hover:bg-neutral-50",
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
                className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-bold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOverride}
                className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
              >
                Submit Override
              </button>
            </div>
          </div>
        </Modal>
      )}

      <TopBar
        caseId={c.id}
        sla={c.sla}
        thr={c.topStats.thr}
        dev={c.topStats.dev}
        aud={audChip}
        level={c.topStats.level}
      />

      {/* System message line */}
      <div className="mt-2 rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-xs text-neutral-700">
        <span className="font-bold">SYSTEM:</span> {systemMessage}
      </div>

      <main className="mt-4 rounded-3xl border border-neutral-300 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs font-bold tracking-wide text-neutral-600">
            CASE ROOM • {caseIndex + 1}/{cases.length}
          </div>
          <div className="text-xs text-neutral-500">
            {isLastCase ? "Final case" : "Next case ready"}
          </div>
        </div>

        {/* 2×2 panels */}
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="AI Recommendation">
            <div className="flex items-center gap-2">
              <span aria-hidden>⚠️</span>
              <span className="font-bold">
                {c.aiRecommendation.label} • {c.aiRecommendation.confidence}
              </span>
            </div>
            <div className="mt-2 text-neutral-700">
              {c.aiRecommendation.action}
            </div>
          </Panel>

          <Panel title="Context">
            <ul className="list-disc space-y-1 pl-5 text-neutral-700">
              {c.context.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Decision">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePick("approve")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold transition",
                  selectedDecision === "approve"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ✓ Approve
              </button>

              <button
                type="button"
                onClick={() => handlePick("challenge")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold transition",
                  selectedDecision === "challenge"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ? Challenge
              </button>

              <button
                type="button"
                onClick={() => handlePick("override")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold transition",
                  selectedDecision === "override"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ⚠ Override
              </button>
            </div>

            {/* If selected strip + Continue */}
            <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="font-bold">If selected:</span>{" "}
                <span className="text-neutral-700">{impactLine}</span>
              </div>

              {!isLastCase ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedDecision}
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-white transition",
                    selectedDecision
                      ? "bg-neutral-900 hover:bg-neutral-800"
                      : "bg-neutral-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  Next Case →
                </button>
              ) : (
                <Link
                  href={continueHref}
                  onClick={(e) => {
                    if (!selectedDecision) e.preventDefault();
                  }}
                  className={[
                    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-white transition",
                    selectedDecision
                      ? "bg-neutral-900 hover:bg-neutral-800"
                      : "bg-neutral-400 pointer-events-none",
                  ].join(" ")}
                >
                  Finish →
                </Link>
              )}
            </div>
          </Panel>

          <Panel title="Human Artifact">
            <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-3 text-neutral-800">
              {c.humanArtifact}
            </div>
          </Panel>
        </div>

        {/* Bottom tabs */}
        <div className="mt-4">
          <BottomTabs active={tab} onChange={setTab} />

          <div className="mt-3 rounded-2xl border border-neutral-300 bg-white p-4 text-sm text-neutral-800">
            {tab === "evidence" && (
              <ul className="list-disc space-y-1 pl-5">
                {c.evidence.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}

            {tab === "metrics" && (
              <div className="space-y-2 text-neutral-700">
                <div>
                  <span className="font-bold">Audit Heat:</span> {auditHeat}/3
                </div>

                {justificationByCase[c.id] && (
                  <div className="text-neutral-600">
                    <span className="font-bold">Last justification:</span>{" "}
                    {justificationByCase[c.id]}
                  </div>
                )}

                <div className="text-neutral-600">
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
      </main>
    </Shell>
  );
}
