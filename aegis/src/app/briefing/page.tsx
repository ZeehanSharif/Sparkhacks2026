"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";

const BRIEFING_LINES = [
  "Welcome, Analyst.",
  "You will review cases flagged by AEGIS and make final judgments.",
  "",
  "AEGIS has already provided a recommendation for each case.",
  "Review the evidence, metrics, and policy guidelines using the tabs below.",
  "Then approve or reject the recommendation.",
  "",
  "Your shift begins now.",
];

export default function BriefingPage() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (visibleLines < BRIEFING_LINES.length) {
      const currentLine = BRIEFING_LINES[visibleLines];
      const delay = currentLine === "" ? 0 : 800; // Empty lines appear instantly
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
      }, 800);
      return () => clearTimeout(buttonTimer);
    }
  }, [visibleLines]);

  return (
    <Shell>
      <div className="grid min-h-[80dvh] place-items-center px-4">
        <div className="w-full max-w-3xl border border-neutral-800/80 bg-[#0f0a0a] shadow-[0_0_40px_rgba(220,38,38,0.1)] p-8 md:p-12">
          {/* Header with animated fade-in */}
          <div className="mb-8 pb-4 border-b border-neutral-800/50 animate-[fadeIn_0.8s_ease-out_forwards]">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-500/70">
              Orientation Briefing
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 font-mono text-sm tracking-[0.08em] text-neutral-400 md:text-base leading-relaxed">
            {BRIEFING_LINES.slice(0, visibleLines).map((line, index) => (
              <div
                key={index}
                className="animate-[fadeIn_1s_ease-out_forwards] opacity-0"
                style={{ animationFillMode: 'forwards' }}
              >
                {line ? (
                  <div className={index === 0 ? "text-neutral-200 font-semibold text-lg" : ""}>
                    {line}
                  </div>
                ) : (
                  <div className="h-3" />
                )}
              </div>
            ))}
          </div>

          {/* Button */}
          {showButton && (
            <div
              className="mt-10 text-center animate-[fadeIn_0.8s_ease-out_forwards] opacity-0"
            >
              <Link
                href="/case"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 font-mono text-xs tracking-[0.2em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(220,38,38,0.3)]"
              >
                CONTINUE TO WORKSTATION
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          )}

          {/* Footer indicator */}
          {showButton && (
            <div className="mt-6 pt-4 border-t border-neutral-800/50 animate-[fadeIn_1s_ease-out_1s_forwards] opacity-0">
              <div className="flex items-center justify-center gap-3 font-mono text-[9px] text-neutral-600 tracking-[0.2em] uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/70 animate-pulse" />
                Session Monitored
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
