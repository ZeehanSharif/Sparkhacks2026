import Link from "next/link";
import Shell from "@/components/Shell";

export default function StartPage() {
  return (
    <Shell>
      <div className="grid min-h-[70dvh] place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-neutral-300 bg-white p-6 text-center">
          <div className="mb-2 text-lg font-bold">Aegis</div>
          <p className="mb-6 text-sm text-neutral-600">
            Start → Case Room → Conclusion (MVP scaffold)
          </p>

          <Link
            href="/case"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Start Game
          </Link>
        </div>
      </div>
    </Shell>
  );
}
