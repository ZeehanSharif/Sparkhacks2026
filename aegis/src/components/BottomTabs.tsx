export type TabKey = "evidence" | "metrics" | "policy";

const tabs: { key: TabKey; label: string }[] = [
  { key: "evidence", label: "Evidence" },
  { key: "metrics", label: "Metrics" },
  { key: "policy", label: "Policy" },
];

export default function BottomTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900 p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            type="button"
            className={[
              "rounded-lg border px-3 py-2 font-mono text-sm font-semibold transition",
              active === t.key
                ? "border-cyan-500/50 bg-cyan-600/20 text-cyan-400"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
