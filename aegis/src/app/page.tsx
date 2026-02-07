import Link from "next/link";
import Shell from "@/components/Shell";

export default function StartPage() {
  return (
    <Shell>
      <div className="grid min-h-[70dvh] place-items-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-1 font-mono text-4xl font-bold tracking-widest text-cyan-400 glow-text">
            CIVIC
          </div>
          <div className="mb-1 font-mono text-xs uppercase tracking-widest text-slate-500">
            Integrated Case Evaluation System
          </div>
          <div className="mb-8 font-mono text-xs text-slate-600">
            Analyst Workstation Terminal
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-900 p-6">
            <div className="mb-4 font-mono text-xs text-slate-500">
              &gt; SYSTEM READY
            </div>
            <div className="mb-6 font-mono text-sm text-slate-400">
              Authenticate to begin case evaluation shift.
            </div>

            <Link
              href="/case"
              className="inline-flex w-full items-center justify-center rounded-lg border border-cyan-500/50 bg-cyan-600/20 px-4 py-3 font-mono text-sm font-bold text-cyan-400 transition hover:bg-cyan-600/30 hover:text-cyan-300"
            >
              [ BEGIN SHIFT ]
            </Link>
          </div>

          <div className="mt-4 font-mono text-xs text-slate-700">
            CIVIC v4.2.1 // Classification: INTERNAL
          </div>
        </div>
      </div>
    </Shell>
  );
}
