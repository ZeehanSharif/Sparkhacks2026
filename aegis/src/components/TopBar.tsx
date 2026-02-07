type TopMetric = {
  label: string;
  value: string;
  valueClassName?: string;
};

type Props = {
  caseId?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  metrics?: TopMetric[];
};

function MetricChip({ label, value, valueClassName }: TopMetric) {
  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] text-neutral-600 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800">
      <span>{label}: </span>
      <span className={valueClassName ?? "text-neutral-300"}>{value}</span>
    </div>
  );
}

export default function TopBar({ caseId = "\u2014", subtitle = "\u2014", actions, metrics = [] }: Props) {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center border border-red-500/50 font-mono text-sm font-bold text-red-500">
            A
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="font-mono tracking-[0.15em] text-neutral-200">AEGIS</span>
              <span className="text-neutral-700">|</span>
              <span className="font-mono text-[10px] tracking-[0.1em] font-normal text-neutral-500">
                OPERATOR-7
              </span>
              <span className="hidden text-neutral-700 sm:inline">|</span>
              <span className="hidden font-mono text-[10px] tracking-[0.1em] font-normal text-neutral-500 sm:inline">
                SHIFT 14:00
              </span>
            </div>
            <div className="font-mono text-xs text-neutral-600">Case #{caseId} | {subtitle}</div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      </div>

      {metrics.length > 0 && (
        <div className="border-t border-neutral-800 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {metrics.map((metric) => (
              <MetricChip
                key={metric.label}
                label={metric.label}
                value={metric.value}
                valueClassName={metric.valueClassName}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
