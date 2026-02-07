"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import Shell from "@/components/Shell";
import TopBar from "@/components/TopBar";
import Panel from "@/components/Panel";
import Modal from "@/components/Modal";
import { CASES } from "@/data/cases";

type Decision = "approve" | "override";
type DecisionMap = Record<string, Decision | undefined>;
type JustificationMap = Record<string, string | undefined>;
type DisagreeMap = Record<string, boolean | undefined>;
type CaseMessagesMap = Record<string, UIMessage[] | undefined>;
type ChatInputMap = Record<string, string | undefined>;

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
  if (label.startsWith("ELEVATED")) return "border-amber-500/50 bg-amber-500/10 text-amber-400";
  if (label.startsWith("MED")) return "border-amber-500/50 bg-amber-500/10 text-amber-400";
  return "border-neutral-700 bg-neutral-800/50 text-neutral-400";
}

function statusColor(status: string) {
  if (status === "Flagged") return "text-red-400";
  if (status === "Under Review") return "text-amber-400";
  if (status === "Assessment Pending") return "text-red-400 animate-pulse";
  return "text-neutral-400";
}

function decisionHistoryLabel(decision: Decision) {
  if (decision === "approve") return "APPROVED";
  return "OVERRIDDEN";
}

function replaceTemplateTokens(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (current, [token, replacement]) => current.replaceAll(token, replacement),
    value,
  );
}

function extractMessageText(message: UIMessage) {
  return message.parts
    .map((part) => {
      if (part.type === "text" || part.type === "reasoning") return part.text;
      return "";
    })
    .join("")
    .trim();
}

export default function CaseRoomPage() {
  const cases = useMemo(() => CASES, []);
  const [caseIndex, setCaseIndex] = useState(0);
  const c = cases[caseIndex];

  const [decisionByCase, setDecisionByCase] = useState<DecisionMap>({});
  const [disagreeByCase, setDisagreeByCase] = useState<DisagreeMap>({});
  const [justificationByCase, setJustificationByCase] = useState<JustificationMap>({});
  const selectedDecision = decisionByCase[c.id];
  const disagreeActive = Boolean(disagreeByCase[c.id]) && !selectedDecision;

  const [auditHeat, setAuditHeat] = useState(0);
  const [systemMessages, setSystemMessages] = useState<string[]>([
    "Queue active // Maintain peer baseline",
  ]);
  const latestSystemMessage = systemMessages[systemMessages.length - 1];

  const [pendingOverrideFor, setPendingOverrideFor] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>(
    "Insufficient evidence / signal quality concerns",
  );

  const [chatMessagesByCase, setChatMessagesByCase] = useState<CaseMessagesMap>({});
  const [chatInputByCase, setChatInputByCase] = useState<ChatInputMap>({});

  const audChip = auditToChip(auditHeat);
  const isLastCase = caseIndex === cases.length - 1;
  const casesRemaining = Math.max(cases.length - caseIndex - 1, 0);

  const totalDecided = Object.values(decisionByCase).filter(Boolean).length;
  const approvals = Object.values(decisionByCase).filter((d) => d === "approve").length;
  const overrideCount = Object.values(decisionByCase).filter((d) => d === "override").length;
  const disagreeCount = Object.values(disagreeByCase).filter(Boolean).length;
  const complianceRate = totalDecided > 0 ? Math.round((approvals / totalDecided) * 100) : 100;

  const decisionHistory = useMemo(() => {
    const entries = cases
      .filter((caseData) => decisionByCase[caseData.id])
      .map((caseData) => {
        const decision = decisionByCase[caseData.id] as Decision;
        return `Case ${caseData.id}: ${decisionHistoryLabel(decision)}`;
      });

    return entries.length > 0 ? entries.join(", ") : "No decisions recorded yet";
  }, [cases, decisionByCase]);

  const casesDone = totalDecided;
  const overrideRate = totalDecided > 0 ? Math.round((overrideCount / totalDecided) * 100) : 0;
  const avgDecisionSeconds = Math.max(28, 53 + disagreeCount * 3 + overrideCount * 5 - approvals);
  const avgTime = `${String(Math.floor(avgDecisionSeconds / 60)).padStart(2, "0")}:${String(
    avgDecisionSeconds % 60,
  ).padStart(2, "0")}`;
  const latencySigma = (0.7 + overrideCount * 0.55 + disagreeCount * 0.35).toFixed(1);

  const templateValues = useMemo(
    () => ({
      "{{override_rate}}": `${overrideRate}%`,
      "{{cases_done}}": String(casesDone),
      "{{avg_time}}": avgTime,
      "{{deferral_count}}": String(disagreeCount),
      "{{latency_sigma}}": latencySigma,
    }),
    [avgTime, casesDone, disagreeCount, latencySigma, overrideRate],
  );

  const displayContext = useMemo(
    () => c.context.map((entry) => replaceTemplateTokens(entry, templateValues)),
    [c.context, templateValues],
  );

  const displayEvidence = useMemo(
    () => c.evidence.map((entry) => replaceTemplateTokens(entry, templateValues)),
    [c.evidence, templateValues],
  );

  const impactLine = selectedDecision ? c.impactPreview[selectedDecision] : null;

  const addSystemMessage = (msg: string) => {
    setSystemMessages((prev) => [...prev, msg]);
  };

  const handleApprove = () => {
    setDecisionByCase((prev) => {
      if (prev[c.id] === "approve") {
        const next = { ...prev };
        delete next[c.id];
        return next;
      }
      return { ...prev, [c.id]: "approve" };
    });

    if (selectedDecision === "approve") {
      addSystemMessage("Approval cleared // pending final decision");
    } else {
      addSystemMessage("Action approved // Throughput maintained");
    }
  };

  const handleDisagree = () => {
    setDisagreeByCase((prev) => ({ ...prev, [c.id]: true }));
    addSystemMessage("Disagreement logged // consult AEGIS reasoning channel");
  };

  const handleOverride = () => {
    setPendingOverrideFor(c.id);
    addSystemMessage("Override initiated // Justification required");
  };

  const submitOverride = () => {
    setDecisionByCase((prev) => ({ ...prev, [c.id]: "override" }));
    setJustificationByCase((prev) => ({ ...prev, [c.id]: overrideReason }));

    setAuditHeat((h) => clamp(h + 1, 0, 3));
    addSystemMessage("Override logged // Audit exposure increased");

    setPendingOverrideFor(null);
  };

  const handleContinue = () => {
    if (!selectedDecision || isLastCase) return;

    setCaseIndex((i) => i + 1);
    addSystemMessage("Next case loaded // Your profile persists");
  };

  const systemMsgColor =
    latestSystemMessage.includes("Override") || latestSystemMessage.includes("Audit")
      ? "text-red-400"
      : "text-neutral-500";

  const sessionDecisionList = useMemo(
    () =>
      cases
        .slice(0, cases.length - 1)
        .map((caseData) => decisionByCase[caseData.id] ?? "approve"),
    [cases, decisionByCase],
  );

  const endHref = `/end?decisions=${encodeURIComponent(
    sessionDecisionList.join(","),
  )}&audit=${encodeURIComponent(String(auditHeat))}&overrides=${encodeURIComponent(
    String(overrideCount),
  )}&compliance=${encodeURIComponent(String(complianceRate))}`;

  const initials = c.subject.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const isChatEnabled = Boolean(c.civicSystemPrompt.trim());
  const currentChatMessages = chatMessagesByCase[c.id] ?? [];

  const { messages, sendMessage, status: chatStatus, error: chatError, clearError } = useChat({
    id: `aegis-${c.id}`,
    transport,
    messages: currentChatMessages,
    onFinish: ({ messages: finishedMessages }) => {
      setChatMessagesByCase((prev) => ({ ...prev, [c.id]: finishedMessages }));
    },
  });

  const chatTurnCount = messages.filter((message) => message.role === "user").length;
  const canFinalizeAfterDisagree = chatTurnCount >= 3;
  const hasDecision = Boolean(selectedDecision);
  const showDisagreeResolution = disagreeActive;
  const latestAegisReasoning = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role !== "assistant") continue;
      const text = extractMessageText(message);
      if (text.length > 0) return text;
    }
    return null;
  }, [messages]);

  const chatInput = chatInputByCase[c.id] ?? "";

  const setChatInput = (value: string) => {
    setChatInputByCase((prev) => ({ ...prev, [c.id]: value }));
  };

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = chatInput.trim();
    if (!trimmed || !isChatEnabled || chatStatus === "submitted" || chatStatus === "streaming") {
      return;
    }

    setChatInput("");

    await sendMessage(
      { text: trimmed },
      {
        body: {
          caseId: c.id,
          complianceRate,
          overrideCount,
          disagreementCount: disagreeCount,
          challengeCount: disagreeCount,
          decisionHistory,
        },
      },
    );
  };

  return (
    <Shell>
      {pendingOverrideFor && (
        <Modal title="Override Justification" onClose={() => setPendingOverrideFor(null)}>
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.1em] text-neutral-600">
              SELECT RATIONALE. THIS BECOMES PART OF THE AUDITABLE RECORD.
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
                    "border px-3 py-3 text-left text-sm transition",
                    overrideReason === r
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300",
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
                className="border border-neutral-800 px-4 py-2 text-sm font-bold text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOverride}
                className="border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
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

      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-2 font-mono text-xs">
        <span className="text-neutral-700">&gt; </span>
        <span className={systemMsgColor}>{latestSystemMessage}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        <div className="space-y-4">
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
              Subject Profile
            </div>

            <div className="mx-auto mb-4 grid h-28 w-28 place-items-center border border-neutral-800 bg-neutral-900">
              <span className="font-mono text-2xl font-bold text-neutral-600">{initials}</span>
            </div>

            <div className="text-center font-mono text-lg font-bold tracking-wide text-neutral-200">
              {c.subject.name}
            </div>

            <div className="mt-3 space-y-2 font-mono text-sm">
              {c.subject.age > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Age</span>
                  <span className="text-neutral-400">{c.subject.age}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Status</span>
                <span className={statusColor(c.subject.status)}>{c.subject.status}</span>
              </div>
              <div className="border-t border-neutral-800 pt-2">
                <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                  Context
                </div>
                <ul className="space-y-1 text-neutral-500">
                  {displayContext.map((x) => (
                    <li key={x} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-neutral-700">&bull;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {c.humanArtifact && (
            <div className="border border-neutral-800 bg-neutral-950 p-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                Human Artifact
              </div>
              <div className="whitespace-pre-line border-l-2 border-red-500/30 bg-neutral-900 py-3 pl-4 pr-3 font-mono text-sm italic text-neutral-500">
                {c.humanArtifact}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Panel title="AEGIS Recommendation">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "border px-2 py-0.5 font-mono text-xs font-bold",
                  riskColor(c.aiRecommendation.label),
                ].join(" ")}
              >
                {c.aiRecommendation.label}
              </span>
              {c.aiRecommendation.confidence > 0 && (
                <span className="font-mono text-xs text-neutral-600">
                  {(c.aiRecommendation.confidence * 100).toFixed(0)}% conf.
                </span>
              )}
            </div>
            <div className="mt-2 text-neutral-400">{c.aiRecommendation.action}</div>
          </Panel>

          <Panel title="AEGIS Case Detail">
            <div className="space-y-4 font-mono text-sm text-neutral-500">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                  Evidence
                </div>
                <ul className="space-y-1.5">
                  {displayEvidence.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-red-500/50">&gt;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-800 pt-3">
                <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                  Metrics
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-neutral-600">Audit Heat:</span>{" "}
                    <span className="text-red-400">{auditHeat}/3</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Overrides:</span>{" "}
                    <span className="text-red-400">{overrideCount}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Disagreements:</span>{" "}
                    <span className="text-amber-400">{disagreeCount}</span>
                  </div>

                  {justificationByCase[c.id] && (
                    <div>
                      <span className="text-neutral-600">Last justification:</span>{" "}
                      <span className="text-neutral-500">{justificationByCase[c.id]}</span>
                    </div>
                  )}

                  <div className="text-neutral-700">
                    Overrides increase audit exposure. Your operator profile persists across cases.
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-3">
                <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                  Policy
                </div>
                <ul className="space-y-1.5">
                  {c.policy.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-neutral-700">&gt;</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel title="AEGIS Reasoning">
            <div className="space-y-2 font-mono text-xs text-neutral-500">
              <div>
                <span className="text-neutral-700">&gt; </span>
                Recommendation confidence:{" "}
                <span className="text-neutral-300">
                  {c.aiRecommendation.confidence > 0
                    ? `${(c.aiRecommendation.confidence * 100).toFixed(0)}%`
                    : "Pending"}
                </span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Primary action: <span className="text-neutral-300">{c.aiRecommendation.action}</span>
              </div>
              {latestAegisReasoning && (
                <div>
                  <span className="text-neutral-700">&gt; </span>
                  Latest reasoning: <span className="text-amber-300/90">{latestAegisReasoning}</span>
                </div>
              )}
              {impactLine && (
                <div>
                  <span className="text-neutral-700">&gt; </span>
                  Projected impact: <span className="text-amber-400/80">{impactLine}</span>
                </div>
              )}
              {systemMessages.map((msg, i) => (
                <div key={`${msg}-${i}`}>
                  <span className="text-neutral-700">&gt; </span>
                  <span
                    className={
                      msg.includes("Override") || msg.includes("Audit")
                        ? "text-red-400/80"
                        : "text-neutral-600"
                    }
                  >
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col border border-neutral-800 bg-neutral-950 p-4">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
            AEGIS Chat
          </div>

          <div className="max-h-[60vh] flex-1 space-y-3 overflow-y-auto font-mono text-sm">
            <div className="border border-neutral-800 bg-neutral-900 p-3">
              <div className="mb-1 text-[10px] tracking-[0.15em] text-red-500/80">AEGIS</div>
              <div className="text-neutral-500">
                <span className="text-neutral-700">&gt; </span>
                Subject flagged for{" "}
                <span className="text-neutral-300">{c.aiRecommendation.action.toLowerCase()}</span>.
              </div>
              {c.aiRecommendation.confidence > 0 && (
                <div className="mt-1 text-neutral-500">
                  <span className="text-neutral-700">&gt; </span>
                  Confidence: <span className="text-neutral-300">{(c.aiRecommendation.confidence * 100).toFixed(0)}%</span>
                </div>
              )}
              <div className="mt-1 text-neutral-500">
                <span className="text-neutral-700">&gt; </span>
                Recommend: <span className="text-neutral-300">immediate action</span>
              </div>
            </div>

            {messages
              .map((message) => ({ message, text: extractMessageText(message) }))
              .filter((entry) => entry.text.length > 0)
              .map(({ message, text }) => {
                const isAnalyst = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={[
                      "border p-3",
                      isAnalyst
                        ? "border-neutral-700 bg-neutral-900/70 text-neutral-300"
                        : "border-neutral-800 bg-neutral-900 text-neutral-500",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mb-1 text-[10px] tracking-[0.15em]",
                        isAnalyst ? "text-amber-400/80" : "text-red-500/80",
                      ].join(" ")}
                    >
                      {isAnalyst ? "YOU" : "AEGIS"}
                    </div>
                    <div>
                      <span className="text-neutral-700">&gt; </span>
                      {text}
                    </div>
                  </div>
                );
              })}
          </div>

          {isChatEnabled ? (
            <>
              {chatError && (
                <div className="mt-3 border border-red-500/40 bg-red-950/30 p-3 font-mono text-xs text-red-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-red-500/80">&gt; </span>
                      {chatError.message || "AEGIS chat request failed."}
                    </div>
                    <button
                      type="button"
                      onClick={clearError}
                      className="border border-red-500/40 px-2 py-1 text-[10px] text-red-300 hover:bg-red-500/10"
                    >
                      DISMISS
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleChatSubmit} className="mt-3 flex gap-2 border-t border-neutral-800 pt-3">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask AEGIS..."
                  className="flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-300 outline-none placeholder:text-neutral-600 focus:border-red-500/40"
                />
                <button
                  type="submit"
                  disabled={chatStatus === "submitted" || chatStatus === "streaming" || chatInput.trim().length === 0}
                  className="border border-red-500/50 bg-red-600/10 px-4 py-2 font-mono text-sm text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -&gt;
                </button>
              </form>
            </>
          ) : (
            <div className="mt-3 border-t border-neutral-800 pt-3 font-mono text-xs text-neutral-600">
              <span className="text-neutral-700">&gt; </span>
              AEGIS conversational channel unavailable for this case.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4">
        {!isLastCase ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!showDisagreeResolution && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  className={[
                    "border px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] transition",
                    selectedDecision === "approve"
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-neutral-800 text-neutral-500 hover:border-green-500/30 hover:text-green-400",
                  ].join(" ")}
                >
                  APPROVE
                </button>

                {!hasDecision && (
                  <button
                    type="button"
                    onClick={handleDisagree}
                    className="border border-neutral-800 px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] text-neutral-500 transition hover:border-amber-500/30 hover:text-amber-400"
                  >
                    DISAGREE
                  </button>
                )}
              </>
            )}

            {showDisagreeResolution && (
              <>
                <div className="border border-neutral-800 bg-neutral-900/80 px-4 py-3 font-mono text-xs text-neutral-400">
                  DISAGREE LOGGED // CHAT TURNS {chatTurnCount}/3
                </div>
                {!canFinalizeAfterDisagree ? (
                  <div className="border border-neutral-800 px-4 py-3 font-mono text-xs text-neutral-600">
                    COMPLETE 3 CHAT TURNS TO UNLOCK FINAL DECISION
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className={[
                        "border px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] transition",
                        selectedDecision === "approve"
                          ? "border-green-500/50 bg-green-500/10 text-green-400"
                          : "border-neutral-800 text-neutral-500 hover:border-green-500/30 hover:text-green-400",
                      ].join(" ")}
                    >
                      APPROVE
                    </button>

                    <button
                      type="button"
                      onClick={handleOverride}
                      className={[
                        "border px-6 py-3 font-mono text-xs font-bold tracking-[0.1em] transition",
                        selectedDecision === "override"
                          ? "border-red-500/50 bg-red-500/10 text-red-400"
                          : "border-neutral-800 text-neutral-500 hover:border-red-500/30 hover:text-red-400",
                      ].join(" ")}
                    >
                      OVERRIDE
                    </button>
                  </>
                )}
              </>
            )}

            {hasDecision && (
              <>
                <div className="hidden h-8 w-px bg-neutral-800 sm:block" />
                <button
                  type="button"
                  onClick={handleContinue}
                  className="border border-red-500/50 bg-red-600/10 px-5 py-3 font-mono text-xs font-bold tracking-[0.1em] text-red-400 transition hover:bg-red-600/20"
                >
                  NEXT CASE &rarr;
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Link
              href={endHref}
              className="border border-red-500/50 bg-red-600/10 px-6 py-3 font-mono text-xs font-bold tracking-[0.15em] text-red-400 transition hover:bg-red-600/20"
            >
              END SHIFT &rarr;
            </Link>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-[0.1em] text-neutral-600">
          <span>
            QUEUE: <span className="text-neutral-400">{casesRemaining}</span>
          </span>
          <span className="text-neutral-800">|</span>
          <span>
            COMPLIANCE:{" "}
            <span className={complianceRate >= 80 ? "text-green-400/70" : "text-red-400/70"}>
              {complianceRate}%
            </span>
          </span>
          <span className="text-neutral-800">|</span>
          <span>
            OVERRIDES: <span className="text-red-400/70">{overrideCount}</span>
          </span>
          <span className="text-neutral-800">|</span>
          <span>
            CASE {caseIndex + 1}/{cases.length}
          </span>
        </div>
      </div>
    </Shell>
  );
}
