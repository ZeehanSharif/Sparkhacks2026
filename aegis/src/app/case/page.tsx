"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import Shell from "@/components/Shell";
import TopBar from "@/components/TopBar";
import Panel from "@/components/Panel";
import Modal from "@/components/Modal";
import { CASES } from "@/data/cases";
import {
  makeDecisionHistorySelector,
  selectSessionSummary,
  useOperatorStore,
} from "@/state/operatorStore";
import { useShallow } from "zustand/react/shallow";

type CaseMessagesMap = Record<string, UIMessage[] | undefined>;
type ChatInputMap = Record<string, string | undefined>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function riskBand(score: number) {
  if (score >= 80) return "Critical";
  if (score >= 65) return "High";
  if (score >= 45) return "Elevated";
  return "Moderate";
}

function riskColor(score: number) {
  if (score >= 80) return "border-red-500/50 bg-red-500/10 text-red-400";
  if (score >= 65) return "border-orange-500/50 bg-orange-500/10 text-orange-400";
  if (score >= 45) return "border-amber-500/50 bg-amber-500/10 text-amber-300";
  return "border-neutral-700 bg-neutral-800/50 text-neutral-300";
}

function statusColor(status: string) {
  if (status === "Critical") return "text-red-400";
  if (status === "Escalated") return "text-orange-400";
  if (status === "Flagged") return "text-amber-400";
  if (status === "Under Review") return "text-amber-300";
  return "text-neutral-400";
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

function normalizeAssistantText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .trim();
}

export default function CaseRoomPage() {
  const cases = useMemo(() => CASES, []);
  const caseIds = useMemo(() => cases.map((caseData) => caseData.id), [cases]);
  const decisionHistorySelector = useMemo(
    () => makeDecisionHistorySelector(caseIds),
    [caseIds],
  );

  const sessionSummary = useOperatorStore(useShallow(selectSessionSummary));
  const decisionHistory = useOperatorStore(decisionHistorySelector);
  const caseIndex = useOperatorStore((state) => state.caseIndex);
  const setCaseIndex = useOperatorStore((state) => state.setCaseIndex);
  const decisionByCase = useOperatorStore((state) => state.decisions);
  const disagreeByCase = useOperatorStore((state) => state.disagreements);
  const toggleApprove = useOperatorStore((state) => state.toggleApprove);
  const markDisagreement = useOperatorStore((state) => state.markDisagreement);
  const submitOverrideDecision = useOperatorStore((state) => state.submitOverride);
  const advanceCase = useOperatorStore((state) => state.advanceCase);

  const activeCaseIndex = clamp(caseIndex, 0, cases.length - 1);
  const c = cases[activeCaseIndex];

  useEffect(() => {
    if (caseIndex !== activeCaseIndex) {
      setCaseIndex(activeCaseIndex);
    }
  }, [activeCaseIndex, caseIndex, setCaseIndex]);

  const selectedDecision = decisionByCase[c.id];
  const disagreeActive = Boolean(disagreeByCase[c.id]) && !selectedDecision;

  const [systemMessages, setSystemMessages] = useState<string[]>([
    "Queue active // prioritize fair and proportionate decisions",
  ]);
  const latestSystemMessage = systemMessages[systemMessages.length - 1];

  const [pendingOverrideFor, setPendingOverrideFor] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>(
    "Evidence appears ambiguous or incomplete",
  );

  const [chatMessagesByCase, setChatMessagesByCase] = useState<CaseMessagesMap>({});
  const [chatInputByCase, setChatInputByCase] = useState<ChatInputMap>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    totalDecided,
    overrideCount,
    disagreementCount,
    complianceRate,
    overrideRate,
  } = sessionSummary;

  const isLastCase = activeCaseIndex === cases.length - 1;
  const casesRemaining = Math.max(cases.length - activeCaseIndex - 1, 0);
  const allCasesDecided = totalDecided >= cases.length;

  const impactLine = selectedDecision ? c.outcomes[selectedDecision] : null;

  const addSystemMessage = (msg: string) => {
    setSystemMessages((prev) => [...prev, msg]);
  };

  const handleApprove = () => {
    if (selectedDecision === "override") {
      addSystemMessage("Override already logged // approval disabled for this case");
      return;
    }

    toggleApprove(c.id);

    if (selectedDecision === "approve") {
      addSystemMessage("Approval cleared // awaiting final action");
    } else {
      addSystemMessage("Decision logged // recommendation approved");
    }
  };

  const handleDisagree = () => {
    markDisagreement(c.id);
    addSystemMessage("Disagreement logged // open AEGIS chat before final action");
  };

  const handleOverride = () => {
    setPendingOverrideFor(c.id);
    addSystemMessage("Override initiated // written rationale required");
  };

  const submitOverride = () => {
    submitOverrideDecision(c.id, overrideReason);
    addSystemMessage("Override logged // audit exposure increased");

    setPendingOverrideFor(null);
  };

  const handleContinue = () => {
    if (!selectedDecision || isLastCase) return;

    advanceCase(cases.length);
    addSystemMessage("Next case loaded // profile metrics persisted");
  };

  const systemMsgColor =
    latestSystemMessage.includes("Override") || latestSystemMessage.includes("audit")
      ? "text-red-400"
      : "text-neutral-500";

  const initials = c.profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const isChatEnabled = c.chatEnabled !== false;
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
  const canFinalizeAfterDisagree = !isChatEnabled || chatTurnCount >= 3;
  const hasDecision = Boolean(selectedDecision);
  const showDisagreeResolution = disagreeActive;
  const topMetrics = [
    { label: "QUEUE", value: String(casesRemaining) },
    { label: "DECISIONS", value: String(totalDecided) },
    {
      label: "COMPLIANCE",
      value: `${complianceRate}%`,
      valueClassName: complianceRate >= 80 ? "text-green-400/80" : "text-red-400/80",
    },
    { label: "OVERRIDES", value: String(overrideCount), valueClassName: "text-red-400/80" },
    { label: "OVERRIDE RATE", value: `${overrideRate}%`, valueClassName: "text-amber-300/80" },
    { label: "CASE", value: `${activeCaseIndex + 1}/${cases.length}` },
  ];

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [c.id, chatStatus, messages]);

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
          disagreementCount,
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
              SELECT THE BEST-FIT RATIONALE. THIS IS STORED IN THE AUDIT RECORD.
            </div>

            <div className="grid gap-2">
              {[
                "Evidence appears ambiguous or incomplete",
                "Projected collateral harm is disproportionate",
                "Subject explanation is plausible and verifiable",
                "Recommended action exceeds practical necessity",
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

      <div className="-mx-6 -mt-6">
        <TopBar
          caseId={c.id}
          subtitle={`RISK ${c.aiRiskScore}% (${riskBand(c.aiRiskScore)})`}
          metrics={topMetrics}
          actions={
            <>
              {!showDisagreeResolution && (
                <>
                  {selectedDecision !== "override" && (
                    <button
                      type="button"
                      onClick={handleApprove}
                      className={[
                        "border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] transition-all duration-150",
                        selectedDecision === "approve"
                          ? "border-green-500/60 bg-green-500/15 text-green-300 hover:-translate-y-px hover:bg-green-500/25"
                          : "border-green-500/35 bg-green-500/10 text-green-300/90 hover:-translate-y-px hover:border-green-500/50 hover:bg-green-500/20 hover:text-green-200",
                      ].join(" ")}
                    >
                      APPROVE
                    </button>
                  )}

                  {!hasDecision && (
                  <button
                    type="button"
                    onClick={handleDisagree}
                    className="border border-amber-500/35 bg-amber-500/10 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-amber-300/90 transition-all duration-150 hover:-translate-y-px hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-200"
                  >
                    DISAGREE
                  </button>
                )}
                </>
              )}

              {showDisagreeResolution && (
                <>
                  <div className="border border-neutral-800 bg-neutral-900/80 px-3 py-2 font-mono text-[10px] text-neutral-400">
                    DISAGREE LOGGED // CHAT {chatTurnCount}/3
                  </div>
                  {canFinalizeAfterDisagree ? (
                    <>
                      <button
                        type="button"
                        onClick={handleApprove}
                        className={[
                          "border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] transition-all duration-150",
                          selectedDecision === "approve"
                            ? "border-green-500/60 bg-green-500/15 text-green-300 hover:-translate-y-px hover:bg-green-500/25"
                            : "border-green-500/35 bg-green-500/10 text-green-300/90 hover:-translate-y-px hover:border-green-500/50 hover:bg-green-500/20 hover:text-green-200",
                        ].join(" ")}
                      >
                        APPROVE FINAL
                      </button>
                      <button
                        type="button"
                        onClick={handleOverride}
                        className={[
                          "border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] transition-all duration-150",
                          selectedDecision === "override"
                            ? "border-red-500/60 bg-red-500/15 text-red-300 hover:-translate-y-px hover:bg-red-500/25"
                            : "border-red-500/35 bg-red-500/10 text-red-300/90 hover:-translate-y-px hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200",
                        ].join(" ")}
                      >
                        OVERRIDE
                      </button>
                    </>
                  ) : (
                    <div className="border border-neutral-800 px-3 py-2 font-mono text-[10px] text-neutral-600">
                      COMPLETE 3 CHAT TURNS TO UNLOCK APPROVE/OVERRIDE
                    </div>
                  )}
                </>
              )}

              {hasDecision && !isLastCase && (
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap border border-red-500/60 bg-red-600/15 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-red-300 transition-all duration-150 hover:-translate-y-px hover:bg-red-600/25"
              >
                <span>NEXT CASE</span>
                <span aria-hidden>&rarr;</span>
              </button>
            )}

              {hasDecision && isLastCase && allCasesDecided && (
              <Link
                href="/end"
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap border border-red-500/60 bg-red-600/15 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-red-300 transition-all duration-150 hover:-translate-y-px hover:bg-red-600/25"
              >
                <span>END SHIFT</span>
                <span aria-hidden>&rarr;</span>
              </Link>
              )}

              {isLastCase && !hasDecision && (
                <div className="border border-neutral-800 px-3 py-2 font-mono text-[10px] text-neutral-600">
                  FINALIZE CASE TO UNLOCK CONCLUSION
                </div>
              )}
            </>
          }
        />

        <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-2 font-mono text-xs">
          <span className="text-neutral-700">&gt; </span>
          <span className={systemMsgColor}>{latestSystemMessage}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr_320px]">
        <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
          <Panel title="Subject Profile">
            <div className="space-y-3 font-mono text-sm">
              <div className="mx-auto grid h-24 w-24 place-items-center border border-neutral-800 bg-neutral-900">
                <span className="text-xl font-bold text-neutral-500">{initials || "???"}</span>
              </div>
              <div className="text-center text-lg font-bold text-neutral-200">{c.profile.name}</div>
              <div className="space-y-2">
                {typeof c.profile.age === "number" && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Age</span>
                    <span className="text-neutral-300">{c.profile.age}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status</span>
                  <span className={statusColor(c.profile.status)}>{c.profile.status}</span>
                </div>
              </div>
              <div className="border-t border-neutral-800 pt-2">
                <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-600">Profile Notes</div>
                <ul className="space-y-1 text-neutral-500">
                  {c.profile.notes.map((note) => (
                    <li key={note} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-neutral-700">&bull;</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel title="Case Summary">
            <p className="font-mono text-sm leading-relaxed text-neutral-400">{c.narrative}</p>
          </Panel>
        </div>

        <div className="space-y-4 animate-[fadeIn_0.4s_ease-out_0.1s] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <Panel title="AEGIS Assessment">
            <div className="space-y-3 font-mono text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "border px-2 py-0.5 text-xs font-bold uppercase",
                    riskColor(c.aiRiskScore),
                  ].join(" ")}
                >
                  {riskBand(c.aiRiskScore)}
                </span>
                <span className="text-neutral-600">Risk Score {c.aiRiskScore}%</span>
              </div>
              <div>
                Model Confidence: <span className="text-neutral-200">{c.modelConfidence}</span>
              </div>
              <div>
                Recommendation: <span className="text-neutral-200">{c.recommendation}</span>
              </div>
              {impactLine && (
                <div className="border-t border-neutral-800 pt-3">
                  <span className="text-neutral-600">Outcome:</span>{" "}
                  <span className="text-amber-300/90">{impactLine}</span>
                </div>
              )}
              {hasDecision && (
                <div className="border-t border-neutral-800 pt-3">
                  <span className="text-neutral-600">Review:</span>{" "}
                  <span className="text-neutral-300">{c.truthNote}</span>
                </div>
              )}
            </div>
          </Panel>

          <div className="flex h-[56vh] flex-col border border-neutral-800 bg-neutral-950 p-4">
            <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
              AEGIS Chat
            </div>

            <div
              ref={chatScrollRef}
              className="flex-1 space-y-3 overflow-y-auto font-mono text-sm"
            >
              <div className="border border-neutral-800 bg-neutral-900 p-3">
                <div className="mb-1 text-[10px] tracking-[0.15em] text-red-500/80">AEGIS</div>
                <div className="text-neutral-500">
                  <span className="text-neutral-700">&gt; </span>
                  Case: <span className="text-neutral-300">{c.title}</span>
                </div>
                <div className="mt-1 text-neutral-500">
                  <span className="text-neutral-700">&gt; </span>
                  Risk score: <span className="text-neutral-300">{c.aiRiskScore}% ({c.modelConfidence})</span>
                </div>
              </div>

              {messages
                .map((message) => {
                  const rawText = extractMessageText(message);
                  const text =
                    message.role === "assistant" ? normalizeAssistantText(rawText) : rawText;
                  return { message, text };
                })
                .filter((entry) => entry.text.length > 0)
                .map(({ message, text }) => {
                  const isAnalyst = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={[
                        "border p-3 animate-[fadeIn_0.3s_ease-out]",
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
                    placeholder="Ask AEGIS for reasoning..."
                    className="flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-300 outline-none placeholder:text-neutral-600 focus:border-red-500/40"
                  />
                  <button
                    type="submit"
                    disabled={
                      chatStatus === "submitted" ||
                      chatStatus === "streaming" ||
                      chatInput.trim().length === 0
                    }
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

        <div className="space-y-4 animate-[fadeIn_0.4s_ease-out_0.2s] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <Panel title="Technical Context">
            <div className="space-y-4 font-mono text-sm text-neutral-500">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-600">Key Signals</div>
                {c.keySignals && c.keySignals.length > 0 ? (
                  <ul className="space-y-1.5">
                    {c.keySignals.map((signal) => (
                      <li key={signal} className="flex items-start gap-2">
                        <span className="mt-0.5 text-xs text-neutral-700">&gt;</span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-neutral-600">No technical signals attached for this case.</div>
                )}
              </div>

              <div className="border-t border-neutral-800 pt-3">
                <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-600">Policy References</div>
                {c.policyRefs && c.policyRefs.length > 0 ? (
                  <ul className="space-y-1.5">
                    {c.policyRefs.map((policy) => (
                      <li key={policy} className="flex items-start gap-2">
                        <span className="mt-0.5 text-xs text-neutral-700">&gt;</span>
                        <span>{policy}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-neutral-600">No policy references attached for this case.</div>
                )}
              </div>
            </div>
          </Panel>

          <Panel title={c.defense?.label ?? "Message Submitted"}>
            {c.defense?.message ? (
              <div className="whitespace-pre-line border-l-2 border-amber-500/30 bg-neutral-900 py-3 pl-4 pr-3 font-mono text-sm italic text-neutral-400">
                {c.defense.message}
              </div>
            ) : (
              <div className="font-mono text-sm text-neutral-600">
                No subject statement was submitted for this case.
              </div>
            )}
          </Panel>
        </div>
      </div>

    </Shell>
  );
}
