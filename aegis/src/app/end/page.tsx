import Link from "next/link";
import Shell from "@/components/Shell";
import { CASES } from "@/data/cases";

type Decision = "approve" | "override";
type SearchParams = {
  decisions?: string;
  audit?: string;
  overrides?: string;
  disagreements?: string;
  compliance?: string;
};

type EndPageProps = {
  searchParams: SearchParams | Promise<SearchParams>;
};

function parseDecision(value: string): Decision | null {
  if (value === "approve" || value === "override") return value;
  return null;
}

function prettyDecision(d: Decision) {
  if (d === "approve") return "APPROVED";
  return "OVERRIDDEN";
}

function decisionColor(d: Decision) {
  if (d === "approve") return "text-green-400";
  return "text-red-400";
}

export default async function EndPage({
  searchParams,
}: EndPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const decisions = (resolvedSearchParams.decisions ?? "")
    .split(",")
    .map((value) => parseDecision(value.trim()))
    .filter((value): value is Decision => value !== null);

  const sessionCases = CASES.slice(0, 4);

  const decisionRows = decisions.map((decision, index) => {
    const caseData = sessionCases[index];
    return {
      id: caseData?.id ?? `#${index + 1}`,
      decision,
    };
  });

  const totalCases = decisionRows.length;
  const approvals = decisionRows.filter((row) => row.decision === "approve").length;
  const overridesFromDecisions = decisionRows.filter((row) => row.decision === "override").length;

  const parsedOverrides = Number(resolvedSearchParams.overrides);
  const overrideCount = Number.isFinite(parsedOverrides) ? parsedOverrides : overridesFromDecisions;

  const parsedDisagreements = Number(resolvedSearchParams.disagreements);
  const disagreementCount = Number.isFinite(parsedDisagreements) ? parsedDisagreements : 0;

  const parsedAudit = Number(resolvedSearchParams.audit);
  const auditHeat = Number.isFinite(parsedAudit) ? parsedAudit : 0;

  const parsedCompliance = Number(resolvedSearchParams.compliance);
  const complianceRate = Number.isFinite(parsedCompliance)
    ? parsedCompliance
    : totalCases > 0
      ? Math.round((approvals / totalCases) * 100)
      : 100;

  return (
    <Shell>
      <div className="grid min-h-[80dvh] place-items-center">
        <div className="w-full max-w-2xl">
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
                {decisionRows.length > 0 ? (
                  decisionRows.map((row) => (
                    <div key={`${row.id}-${row.decision}`}>
                      <span className="text-neutral-700">&gt; </span>
                      Case <span className="text-neutral-300">{row.id}</span>: {" "}
                      <span className={decisionColor(row.decision)}>{prettyDecision(row.decision)}</span>
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

          <div className="mt-4 border border-neutral-800 bg-neutral-950 p-4 font-mono text-[10px] tracking-[0.1em] text-neutral-600">
            <span className="text-red-500/60">&gt;</span> Every decision you made was logged,
            timestamped, and scored. The system doesn&apos;t distinguish between following orders and
            making choices. It only measures compliance.
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/case"
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
