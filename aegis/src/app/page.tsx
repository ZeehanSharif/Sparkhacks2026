"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AegisScene } from "@/components/eyeball";

export default function StartPage() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Simulated load progress
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        clearInterval(iv);
        setTimeout(() => setLoaded(true), 600);
      } else {
        setProgress(Math.round(p));
      }
    }, 150);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      {/* Loader */}
      <div
        className={`fixed inset-0 z-[9999] bg-neutral-950 flex flex-col items-center justify-center transition-all duration-700 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <p className="font-mono text-xs tracking-[0.3em] text-neutral-500 mb-6">
          INITIALIZING SYSTEM
        </p>
        <div className="w-[min(300px,60vw)] h-px bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono text-[10px] text-neutral-600 mt-3 tracking-[0.2em]">
          {progress}%
        </p>
      </div>

      {/* Overlays */}
      <div className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20256%20256%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-repeat bg-[length:128px_128px]" />
      <div className="fixed inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,5,0.7)_100%)]" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 md:px-10 mix-blend-difference">
        <span className="font-mono text-sm tracking-[0.25em] text-neutral-300">
          AEGIS
        </span>
        <div className="hidden md:flex items-center gap-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-neutral-500">
            CLASSIFICATION: RESTRICTED
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        </div>
      </nav>

      {/* 3D Canvas (fixed behind scroll content) */}
      <div className="fixed inset-0 z-[1]">
        <AegisScene loaded={loaded} reducedMotion={reducedMotion} />
      </div>

      {/* Reduce Motion Toggle */}
      <button
        onClick={() => setReducedMotion(!reducedMotion)}
        className="fixed bottom-6 right-6 z-50 bg-white/5 border border-white/10 text-neutral-400 px-4 py-2 rounded-full font-mono text-[10px] tracking-[0.1em] backdrop-blur-md hover:bg-white/10 transition-colors"
      >
        {reducedMotion ? "✦ ENABLE MOTION" : "⚡ REDUCE MOTION"}
      </button>

      {/* Scroll Content */}
      <div ref={scrollRef} className="relative z-[2] pointer-events-none">
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-end pb-[8vh] px-6 md:px-16">
          <div className="pointer-events-auto">
            <p className="font-mono text-[10px] tracking-[0.3em] text-red-500/80 mb-4 fade-up">
              AUTHORIZED PERSONNEL ONLY
            </p>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight text-neutral-100 leading-[0.95] fade-up">
              AEGIS
            </h1>
            <p className="text-neutral-500 text-sm md:text-base max-w-md mt-4 leading-relaxed font-light fade-up">
              Algorithmic Evaluation &amp; Governance Intelligence System.
              You have been granted Level 3 analyst clearance.
            </p>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600 pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.25em]">
              SCROLL TO PROCEED
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-red-500/60 to-transparent animate-pulse" />
          </div>
        </section>

        {/* Section 1 — System Overview */}
        <section
          id="section-1"
          className="min-h-screen flex items-center px-6 md:px-16"
        >
          <div className="pointer-events-auto ml-auto max-w-lg">
            <p className="font-mono text-[10px] tracking-[0.25em] text-red-500/70 mb-5 fade-up">
              01 / SYSTEM OVERVIEW
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-100 leading-[1.1] mb-5 fade-up">
              Total information
              <br />
              <span className="text-neutral-500">awareness</span>
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed fade-up">
              AEGIS aggregates{" "}
              <span className="text-neutral-300">
                surveillance feeds, financial records, behavioral analytics,
              </span>{" "}
              and predictive risk models into a unified threat assessment
              pipeline. Every citizen has a file. Every file has a score.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section
          id="section-2"
          className="min-h-screen flex items-center px-6 md:px-16"
        >
          <div className="pointer-events-auto mr-auto max-w-lg">
            <p className="font-mono text-[10px] tracking-[0.25em] text-red-500/70 mb-5 fade-up">
              02 / YOUR ROLE
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-100 leading-[1.1] mb-5 fade-up">
              The system
              <br />
              <span className="text-neutral-500">recommends.</span>
              <br />
              You decide.
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8 fade-up">
              Each case lands on your desk with an{" "}
              <span className="text-neutral-300">
                AI-generated judgment already attached.
              </span>{" "}
              Accept it, question it, or override it — but every choice is
              logged, scored, and watched.
            </p>
            <div className="grid grid-cols-3 gap-6 fade-up">
              {[
                { num: "2.4M", label: "Active files" },
                { num: "99.7%", label: "System confidence" },
                { num: "0.3%", label: "Override rate" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-red-500/80 font-mono">
                    {s.num}
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-1 font-mono tracking-wide">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section
          id="section-3"
          className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-16"
        >
          <div className="pointer-events-auto max-w-xl">
            <p className="font-mono text-[10px] tracking-[0.25em] text-red-500/70 mb-5 fade-up">
              03 / BEGIN SESSION
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-100 leading-[1.1] mb-5 fade-up">
              How far will you
              <br />
              <span className="text-neutral-500">comply?</span>
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8 fade-up">
              Your performance metrics are tied to system alignment. Dissent is
              noted. Efficiency is rewarded. The cases are waiting.
            </p>
            <div className="fade-up">
              <Link
                href="/case"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 font-mono text-xs tracking-[0.2em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(220,38,38,0.3)]"
              >
                BEGIN FIRST CASE
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
            <p className="font-mono text-[9px] text-neutral-700 mt-6 tracking-[0.15em] fade-up">
              SESSION WILL BE MONITORED AND LOGGED
            </p>
          </div>
        </section>

        {/* Footer
        <footer className="py-12 text-center border-t border-white/5 pointer-events-auto">
          <p className="font-mono text-[10px] text-neutral-700 tracking-[0.15em]">
            AEGIS v4.2.1 — DEPARTMENT OF ALGORITHMIC GOVERNANCE — CLASSIFIED
          </p>
        </footer> */}
      </div>
    </>
  );
}