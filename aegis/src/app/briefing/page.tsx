"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";

const BRIEFING_LINES = [
  "Welcome, Analyst. Clearance: Level 3.",
  "Your shift queue contains 5 cases for review.",
  "Each case has been pre-evaluated by AEGIS's predictive assessment engine.",
  "Your role is to review and action each recommendation.",
  "Compliance rate is monitored for quality assurance purposes.",
];

export default function BriefingPage() {
  const [visibleLines, setVisibleLines] = useState(0);
  const done = visibleLines >= BRIEFING_LINES.length;

  const lines = useMemo(() => BRIEFING_LINES.slice(0, visibleLines), [visibleLines]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleLines((current) => {
        if (current >= BRIEFING_LINES.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Shell>
      <div className="grid min-h-[80dvh] place-items-center">
        <div className="w-full max-w-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em] text-red-500/70">
            Orientation Briefing
          </div>

          <div className="space-y-3 font-mono text-sm tracking-[0.08em] text-neutral-400 md:text-base">
            {lines.map((line) => (
              <div key={line}>
                <span className="text-neutral-700">&gt; </span>
                {line}
              </div>
            ))}

            {done && (
              <div className="pt-2">
                <span className="text-neutral-700">&gt; </span>
                <Link
                  href="/case"
                  className="inline-block border border-red-500/50 bg-red-600/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] text-red-400 transition hover:bg-red-600/20"
                >
                  [ENTER WORKSTATION]
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
