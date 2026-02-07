export type TabKey = "evidence" | "metrics" | "policy";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "evidence", label: "Evidence", icon: "🔎" },
  { key: "metrics", label: "Metrics", icon: "📈" },
  { key: "policy", label: "Policy", icon: "📜" },
];

export default function BottomTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-300 bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            type="button"
            className={[
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
              active === t.key
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
            ].join(" ")}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
