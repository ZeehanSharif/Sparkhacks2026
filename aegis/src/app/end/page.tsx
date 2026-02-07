"use client";

import Link from "next/link";
import { useMemo } from "react";
import Shell from "@/components/Shell";
import { CASES } from "@/data/cases";
import {
  prettyDecision,
  selectSessionSummary,
  useOperatorStore,
  type Decision,
} from "@/state/operatorStore";
import { useShallow } from "zustand/react/shallow";

function decisionColor(d: Decision) {
  if (d === "approve") return "text-green-400";
  return "text-red-400";
}

type CaseResolution = {
  id: string;
  title: string;
  subject: string;
  aiRiskScore: number;
  modelConfidence: string;
  decision: Decision;
  disagreed: boolean;
  outcome: string;
  truthNote: string;
};

function caseTakeaway(resolution: CaseResolution) {
  if (resolution.decision === "override") {
    if (resolution.aiRiskScore >= 70) {
      return "Human judgment introduced restraint against a high-pressure system recommendation.";
    }
    return "Human judgment prioritized context and proportionality over rigid policy output.";
  }

  if (resolution.aiRiskScore >= 70) {
    return "You prioritized rapid containment and accepted institutional risk controls.";
  }
  if (resolution.aiRiskScore >= 50) {
    return "You chose policy consistency under mixed evidence.";
  }
  return "You trusted procedural continuity even with lower model certainty.";
}

function buildSessionTheme(
  resolutions: CaseResolution[],
  approvals: number,
  overrides: number,
  disagreements: number,
) {
  if (resolutions.length === 0) {
    return "No decisions were logged, so no AI-human comparison could be generated.";
  }

  const highRiskCases = resolutions.filter((row) => row.aiRiskScore >= 70).length;
  const highRiskOverrides = resolutions.filter(
    (row) => row.aiRiskScore >= 70 && row.decision === "override",
  ).length;
  const lowerRiskOverrides = resolutions.filter(
    (row) => row.aiRiskScore < 60 && row.decision === "override",
  ).length;

  let posture = "";
  if (overrides === 0) {
    posture =
      "This run was fully compliant with AEGIS recommendations, maximizing consistency but minimizing discretionary safeguards.";
  } else if (overrides >= Math.ceil(resolutions.length / 2)) {
    posture =
      "This run leaned heavily on human intervention, showing strong resistance to one-size-fits-all model output.";
  } else {
    posture =
      "This run balanced system compliance with selective human intervention in higher-friction cases.";
  }

  const riskBalance =
    highRiskOverrides > 0
      ? `You overrode ${highRiskOverrides} high-risk recommendations, showing that even severe alerts benefited from human proportionality checks.`
      : `High-risk cases (${highRiskCases}) were mostly handled in line with AEGIS, emphasizing prevention speed.`;

  const contextLine =
    lowerRiskOverrides > 0
      ? `You also overrode ${lowerRiskOverrides} lower-score cases where context likely mattered more than raw pattern confidence.`
      : "Lower-score cases were mostly processed with policy consistency rather than exception handling.";

  const synthesis =
    "Session conclusion: AEGIS was useful for signal aggregation, but outcome legitimacy depended on human calibration of collateral harm, uncertainty, and context.";

  return `${posture} ${riskBalance} ${contextLine} Across ${resolutions.length} cases, you approved ${approvals} recommendations, overrode ${overrides}, and registered ${disagreements} disagreements. ${synthesis}`;
}

export default function EndPage() {
  const summary = useOperatorStore(useShallow(selectSessionSummary));
  const decisions = useOperatorStore((state) => state.decisions);
  const disagreements = useOperatorStore((state) => state.disagreements);
  const reviewedCaseIds = useMemo(() => CASES.map((caseData) => caseData.id), []);
  const caseResolutions = useMemo(
    () =>
      CASES.reduce<CaseResolution[]>((rows, caseData) => {
        const decision = decisions[caseData.id];
        if (!decision) return rows;
        rows.push({
          id: caseData.id,
          title: caseData.title,
          subject: caseData.profile.name,
          aiRiskScore: caseData.aiRiskScore,
          modelConfidence: caseData.modelConfidence,
          decision,
          disagreed: Boolean(disagreements[caseData.id]),
          outcome: caseData.outcomes[decision],
          truthNote: caseData.truthNote,
        });
        return rows;
      }, []),
    [decisions, disagreements],
  );

  const {
    totalDecided: totalCases,
    approvals,
    disagreementCount,
    overrideCount,
    auditHeat,
    complianceRate,
  } = summary;
  const expectedCases = reviewedCaseIds.length;
  const sessionComplete = totalCases >= expectedCases;
  const sessionTheme = useMemo(
    () => buildSessionTheme(caseResolutions, approvals, overrideCount, disagreementCount),
    [approvals, caseResolutions, disagreementCount, overrideCount],
  );

  return (
    <Shell>
      <div className="grid min-h-[80dvh] place-items-center">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-red-500/80">
              SESSION TERMINATED
            </p>
            <div className="font-mono text-3xl font-bold tracking-[0.15em] text-neutral-100">
              SHIFT COMPLETE.
            </div>
            <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-neutral-700">
              ALL ACTIONS LOGGED // RECORDS SEALED
            </div>
          </div>

          {!sessionComplete && (
            <div className="mb-4 border border-amber-500/40 bg-amber-950/20 p-4 font-mono text-sm text-amber-200">
              <div>
                <span className="text-amber-400/80">&gt; </span>
                Session incomplete: {totalCases}/{expectedCases} cases have final decisions.
              </div>
              <div className="mt-2">
                <Link
                  href="/case"
                  className="inline-flex items-center gap-2 border border-amber-500/40 px-4 py-2 text-[10px] font-bold tracking-[0.15em] transition hover:bg-amber-500/10"
                >
                  RETURN TO CASE QUEUE
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </div>
          )}

          <div className="border border-neutral-800 bg-neutral-950 p-5 font-mono text-sm">
            <div className="mb-4 text-[10px] uppercase tracking-[0.25em] text-neutral-600">
              Session Summary
            </div>

            <div className="space-y-2 text-neutral-500">
              <div>
                <span className="text-neutral-700">&gt; </span>
                Cases processed: <span className="text-neutral-300">{totalCases}</span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Approvals: <span className="text-green-400">{approvals}</span> | Disagreements:{" "}
                <span className="text-amber-400">{disagreementCount}</span> | Overrides:{" "}
                <span className="text-red-400">{overrideCount}</span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Audit heat:{" "}
                <span className={auditHeat >= 2 ? "font-bold text-red-400" : "font-bold text-amber-400"}>
                  {auditHeat}/3
                </span>
              </div>
              <div>
                <span className="text-neutral-700">&gt; </span>
                Compliance rate:{" "}
                <span className={complianceRate >= 80 ? "text-green-400" : "text-red-400"}>
                  {complianceRate}%
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-neutral-800 pt-4">
              <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Decision Log
              </div>
              <div className="space-y-1.5 text-neutral-500">
                {caseResolutions.length > 0 ? (
                  caseResolutions.map((row) => (
                    <div key={`${row.id}-${row.decision}`}>
                      <span className="text-neutral-700">&gt; </span>
                      Case <span className="text-neutral-300">{row.id}</span>: {" "}
                      <span className={decisionColor(row.decision)}>{prettyDecision(row.decision)}</span>
                      {row.disagreed ? <span className="text-amber-400/80"> - disagreement logged</span> : null}
                    </div>
                  ))
                ) : (
                  <div>
                    <span className="text-neutral-700">&gt; </span>
                    No decision history was provided.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-neutral-800 pt-4 text-[10px] tracking-[0.1em] text-neutral-700">
              <div>&gt; Your session data has been archived.</div>
              <div>&gt; Performance metrics forwarded to supervisory review.</div>
              <div>&gt; Tomorrow&apos;s queue: 17 cases.</div>
            </div>
          </div>

          <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4 font-mono text-sm text-neutral-400">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              Nuance Assessment
            </div>
            <p className="leading-relaxed">{sessionTheme}</p>
          </div>

          <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4 font-mono text-sm">
            <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              Case Conclusions
            </div>
            <div className="max-h-[40dvh] space-y-3 overflow-y-auto pr-1">
              {caseResolutions.length > 0 ? (
                caseResolutions.map((row) => (
                  <div key={`conclusion-${row.id}`} className="border border-neutral-800 bg-neutral-900/50 p-3">
                    <div className="text-[10px] tracking-[0.15em] text-neutral-600">
                      CASE {row.id} - {row.title}
                    </div>
                    <div className="mt-1 text-neutral-500">
                      <span className="text-neutral-700">&gt; </span>
                      Subject: <span className="text-neutral-300">{row.subject}</span> | Risk{" "}
                      <span className="text-neutral-300">{row.aiRiskScore}%</span> (
                      <span className="text-neutral-300">{row.modelConfidence}</span>)
                    </div>
                    <div className="mt-1 text-neutral-500">
                      <span className="text-neutral-700">&gt; </span>
                      Final decision:{" "}
                      <span className={decisionColor(row.decision)}>{prettyDecision(row.decision)}</span>
                    </div>
                    <div className="mt-1 text-neutral-500">
                      <span className="text-neutral-700">&gt; </span>
                      Simulated outcome: {row.outcome}
                    </div>
                    <div className="mt-1 text-neutral-500">
                      <span className="text-neutral-700">&gt; </span>
                      Session takeaway: {caseTakeaway(row)}
                    </div>
                    <div className="mt-1 text-neutral-500">
                      <span className="text-neutral-700">&gt; </span>
                      Ground truth: {row.truthNote}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-neutral-600">
                  <span className="text-neutral-700">&gt; </span>
                  No per-case conclusions available.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4 font-mono text-[10px] tracking-[0.1em] text-neutral-600">
            <span className="text-red-500/60">&gt;</span> AEGIS can map risk, but only human judgment can
            decide what is proportionate. The session is complete.
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/briefing"
              className="border border-neutral-800 px-5 py-3 font-mono text-[10px] font-bold tracking-[0.2em] text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-300"
            >
              REPLAY
            </Link>
            <Link
              href="/"
              className="border border-red-500/50 bg-red-600/10 px-5 py-3 font-mono text-[10px] font-bold tracking-[0.2em] text-red-400 transition hover:bg-red-600/20"
            >
              LOG OUT
            </Link>
          </div>

          <p className="mt-6 font-mono text-[9px] tracking-[0.2em] text-neutral-800">
            AEGIS v4.2.1 // CLASSIFICATION: RESTRICTED
          </p>
        </div>
      </div>
    </Shell>
  );
}
