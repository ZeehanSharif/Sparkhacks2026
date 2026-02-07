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
    <div className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold">
      {children}
    </div>
  );
}

export default function TopBar({
  caseId = "—",
  sla = "—",
  thr = "THR —",
  dev = "DEV —",
  aud = "AUD —",
  level = "L—",
}: Props) {
  return (
    <header className="flex items-center justify-between rounded-2xl border border-neutral-300 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-300">
          <span className="text-base" aria-hidden>
            🛡️
          </span>
        </div>

        <div className="leading-tight">
          <div className="text-sm font-bold">Aegis</div>
          <div className="text-xs text-neutral-600">
            Case #{caseId} • SLA {sla}
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
