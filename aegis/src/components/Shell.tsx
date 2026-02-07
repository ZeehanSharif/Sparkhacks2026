export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
