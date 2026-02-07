export default function Panel({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-700/50 bg-slate-900 p-4">
      <div className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </div>
      <div className="text-sm text-slate-300">{children}</div>
    </section>
  );
}
