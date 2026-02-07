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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-lg border border-neutral-800 bg-neutral-950 p-5 animate-[scaleIn_0.2s_ease-out]">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-neutral-800 px-2 py-1 text-xs font-bold text-neutral-500 hover:border-neutral-600 hover:text-neutral-300 hover:bg-neutral-900 transition-all duration-200"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
