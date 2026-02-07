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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-sm font-bold uppercase tracking-widest text-slate-400">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-700 px-2 py-1 text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-slate-200"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
