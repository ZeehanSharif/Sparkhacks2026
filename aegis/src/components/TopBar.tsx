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
    <div className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-xs font-semibold text-neutral-400">
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
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center border border-red-500/50 font-mono text-sm font-bold text-red-500">
          A
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="font-mono tracking-[0.15em] text-neutral-200">AEGIS</span>
            <span className="text-neutral-700">|</span>
            <span className="font-mono text-[10px] tracking-[0.1em] text-neutral-500 font-normal">OPERATOR-7</span>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <span className="font-mono text-[10px] tracking-[0.1em] text-neutral-500 font-normal hidden sm:inline">SHIFT 14:00</span>
          </div>
          <div className="font-mono text-xs text-neutral-600">
            Case #{caseId} | {sla}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Chip>{thr}</Chip>
          <Chip>{dev}</Chip>
          <Chip>{aud}</Chip>
          <Chip>{level}</Chip>
        </div>
        <span className="ml-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>
    </header>
  );
}
