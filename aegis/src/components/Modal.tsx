export default function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-300 bg-white p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-bold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-2 py-1 text-xs font-bold hover:bg-neutral-50"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
