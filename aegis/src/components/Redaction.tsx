import { useOperatorStore } from "@/state/operatorStore";
import { useEffect } from "react";

export default function Redaction({ children }: { children: React.ReactNode }) {
  const auditHeat = useOperatorStore((s) => s.auditHeat);
  // If auditHeat is high, redact children
  if (auditHeat >= 2) {
    return (
      <span className="bg-neutral-900 text-neutral-900 select-none rounded px-2 py-0.5">
        █████████████
      </span>
    );
  }
  return <>{children}</>;
}
