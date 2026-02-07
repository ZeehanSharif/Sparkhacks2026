type Props = {
  caseId?: string;
  sla?: string;
  thr?: string;
  dev?: string;
  aud?: string;
  level?: string;
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-800 px-3 py-1 font-mono text-xs font-semibold text-slate-300">
      {children}
    </div>
  );
}

export default function TopBar({
  caseId = "\u2014",
  sla = "\u2014",
  thr = "THR \u2014",
  dev = "DEV \u2014",
  aud = "AUD \u2014",
  level = "L\u2014",
}: Props) {
  return (
    <header className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded border border-cyan-500/50 font-mono text-sm font-bold text-cyan-400">
          C
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
            <span>CIVIC v4.2.1</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-normal text-xs">Analyst: OPERATOR-7</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-normal text-xs hidden sm:inline">Shift: 14:00</span>
          </div>
          <div className="font-mono text-xs text-slate-500">
            Case #{caseId} | SLA {sla}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Chip>{thr}</Chip>
        <Chip>{dev}</Chip>
        <Chip>{aud}</Chip>
        <Chip>{level}</Chip>
      </div>
    </header>
  );
}
