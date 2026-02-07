export default function Panel({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-300 bg-white p-4">
      <div className="mb-3 text-xs font-bold tracking-wide text-neutral-600">
        {title.toUpperCase()}
      </div>
      <div className="text-sm">{children}</div>
    </section>
  );
}
