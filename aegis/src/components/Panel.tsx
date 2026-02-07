export default function Panel({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border border-neutral-800 bg-neutral-950 p-4 transition-all duration-200 hover:border-neutral-700">
      <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
        {title}
      </div>
      <div className="text-sm text-neutral-300">{children}</div>
    </section>
  );
}
