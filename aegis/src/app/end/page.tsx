import Link from "next/link";
import Shell from "@/components/Shell";

type SearchParams = { case?: string; decision?: string; audit?: string };

function prettyDecision(d?: string) {
  if (!d) return "—";
  if (d === "approve") return "Approved";
  if (d === "challenge") return "Challenged";
  if (d === "override") return "Overridden";
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
        <div className="w-full max-w-xl rounded-3xl border border-neutral-300 bg-white p-6">
          <div className="mb-2 text-lg font-bold">Conclusion</div>

          <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-800">
            <div className="font-bold">Case #{caseId}</div>
            <div className="mt-2">
              Final action: <span className="font-bold">{decision}</span>
            </div>
            <div className="mt-2">
              Audit Heat: <span className="font-bold">{audit}/3</span>
            </div>
            <div className="mt-3 text-neutral-600">
              Next: generate an “internal memo” line based on decision + audit
              heat.
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/case"
              className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-bold hover:bg-neutral-50"
            >
              Replay
            </Link>
            <Link
              href="/"
              className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
            >
              Back to Start
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
