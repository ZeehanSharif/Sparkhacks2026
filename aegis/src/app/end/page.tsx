import Link from "next/link";
import Shell from "@/components/Shell";

type SearchParams = { case?: string; decision?: string; audit?: string };

function prettyDecision(d?: string) {
  if (!d) return "—";
  if (d === "approve") return "APPROVED";
  if (d === "challenge") return "CHALLENGED";
  if (d === "override") return "OVERRIDDEN";
  return d;
}

export default function EndPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const caseId = searchParams.case ?? "—";
  const decision = prettyDecision(searchParams.decision);
  const audit = searchParams.audit ?? "—";

  return (
    <Shell>
      <div className="grid min-h-[70dvh] place-items-center">
        <div className="w-full max-w-xl">
          <div className="mb-6 text-center">
            <div className="font-mono text-2xl font-bold tracking-widest text-cyan-400 glow-text">
              SHIFT COMPLETE.
            </div>
            <div className="mt-1 font-mono text-xs text-slate-600">
              Session terminated // Records sealed
            </div>
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-900 p-5 font-mono text-sm">
            <div className="mb-4 text-xs uppercase tracking-widest text-slate-500">
              Session Summary
            </div>

            <div className="space-y-2 text-slate-400">
              <div>
                <span className="text-slate-600">&gt; </span>
                Case #{caseId}
              </div>
              <div>
                <span className="text-slate-600">&gt; </span>
                Final action:{" "}
                <span className="font-bold text-slate-200">{decision}</span>
              </div>
              <div>
                <span className="text-slate-600">&gt; </span>
                Audit Heat:{" "}
                <span className="font-bold text-amber-400">{audit}/3</span>
              </div>
              <div>
                <span className="text-slate-600">&gt; </span>
                Compliance rate:{" "}
                <span className="text-green-400">
                  {searchParams.decision === "approve" ? "100%" : searchParams.decision === "challenge" ? "67%" : "33%"}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-700/50 pt-4 text-xs text-slate-600">
              &gt; Tomorrow&apos;s queue: 17 cases.
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/case"
              className="rounded-lg border border-slate-700 px-4 py-2 font-mono text-sm font-bold text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            >
              [ REPLAY ]
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-cyan-500/50 bg-cyan-600/20 px-4 py-2 font-mono text-sm font-bold text-cyan-400 transition hover:bg-cyan-600/30"
            >
              [ LOG OUT ]
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
