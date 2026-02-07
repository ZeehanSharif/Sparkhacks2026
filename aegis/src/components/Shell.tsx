export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0a0f1a] text-slate-200">
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
