import Link from "next/link";
import Shell from "@/components/Shell";

export default function EndPage() {
  return (
    <Shell>
      <div className="grid min-h-[70dvh] place-items-center">
        <div className="w-full max-w-xl rounded-3xl border border-neutral-300 bg-white p-6">
          <div className="mb-2 text-lg font-bold">Conclusion</div>

          <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-800">
            Outcome placeholder: case result + operator profile summary.
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
