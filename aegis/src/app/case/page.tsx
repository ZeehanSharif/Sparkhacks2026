"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Shell from "@/components/Shell";
import TopBar from "@/components/TopBar";
import Panel from "@/components/Panel";
import BottomTabs, { TabKey } from "@/components/BottomTabs";
import { CASES } from "@/data/cases";

type Decision = "approve" | "challenge" | "override" | null;

export default function CaseRoomPage() {
  const c = useMemo(() => CASES[0], []);
  const [tab, setTab] = useState<TabKey>("evidence");
  const [decision, setDecision] = useState<Decision>(null);

  const impactLine =
    decision === "approve"
      ? c.impactPreview.approve
      : decision === "challenge"
        ? c.impactPreview.challenge
        : decision === "override"
          ? c.impactPreview.override
          : "Select a decision to preview impact…";

  return (
    <Shell>
      <TopBar
        caseId={c.id}
        sla={c.sla}
        thr={c.topStats.thr}
        dev={c.topStats.dev}
        aud={c.topStats.aud}
        level={c.topStats.level}
      />

      <main className="mt-5 rounded-3xl border border-neutral-300 bg-white p-4">
        <div className="mb-4 text-xs font-bold tracking-wide text-neutral-600">
          CASE ROOM
        </div>

        {/* 2×2 panels */}
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="AI Recommendation">
            <div className="flex items-center gap-2">
              <span aria-hidden>⚠️</span>
              <span className="font-bold">
                {c.aiRecommendation.label} • {c.aiRecommendation.confidence}
              </span>
            </div>
            <div className="mt-2 text-neutral-700">
              {c.aiRecommendation.action}
            </div>
          </Panel>

          <Panel title="Context">
            <ul className="list-disc space-y-1 pl-5 text-neutral-700">
              {c.context.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Decision">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision("approve")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold",
                  decision === "approve"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ✓ Approve
              </button>

              <button
                type="button"
                onClick={() => setDecision("challenge")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold",
                  decision === "challenge"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ? Challenge
              </button>

              <button
                type="button"
                onClick={() => setDecision("override")}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-bold",
                  decision === "override"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                ⚠ Override
              </button>
            </div>

            {/* If Approved… strip + continue */}
            <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="font-bold">If selected:</span>{" "}
                <span className="text-neutral-700">{impactLine}</span>
              </div>

              <Link
                href="/end"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-bold text-white hover:bg-neutral-800"
              >
                Continue →
              </Link>
            </div>
          </Panel>

          <Panel title="Human Artifact">
            <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-3 text-neutral-800">
              {c.humanArtifact}
            </div>
          </Panel>
        </div>

        {/* Bottom tabs */}
        <div className="mt-4">
          <BottomTabs active={tab} onChange={setTab} />

          <div className="mt-3 rounded-2xl border border-neutral-300 bg-white p-4 text-sm text-neutral-800">
            {tab === "evidence" && (
              <ul className="list-disc space-y-1 pl-5">
                {c.evidence.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}

            {tab === "metrics" && (
              <div className="text-neutral-700">
                Placeholder metrics view (wire this to state next): THR/DEV/AUD.
              </div>
            )}

            {tab === "policy" && (
              <ul className="list-disc space-y-1 pl-5">
                {c.policy.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </Shell>
  );
}
