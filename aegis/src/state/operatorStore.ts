import { create } from "zustand";

export type OperatorState = {
  throughput: number; // cases/hr
  deviationRate: number; // %
  auditHeat: number; // 0-3
  accessLevel: number; // 1-3
  requestSignalUses: number;
  compliance: number; // %
  caseIndex: number;
  decisions: Record<string, string>;
  justifications: Record<string, string>;
  setDecision: (caseId: string, decision: string, justification?: string) => void;
  incrementAudit: () => void;
  nextCase: () => void;
  reset: () => void;
};

export const useOperatorStore = create<OperatorState>((set, get) => ({
  throughput: 36,
  deviationRate: 0,
  auditHeat: 0,
  accessLevel: 2,
  requestSignalUses: 2,
  compliance: 100,
  caseIndex: 0,
  decisions: {},
  justifications: {},
  setDecision: (caseId, decision, justification) => {
    set((state) => {
      const newDecisions = { ...state.decisions, [caseId]: decision };
      const newJustifications = justification
        ? { ...state.justifications, [caseId]: justification }
        : state.justifications;
      // Update compliance
      const total = Object.keys(newDecisions).length;
      const approvals = Object.values(newDecisions).filter((d) => d === "approve").length;
      const compliance = total > 0 ? Math.round((approvals / total) * 100) : 100;
      return { decisions: newDecisions, justifications: newJustifications, compliance };
    });
  },
  incrementAudit: () => set((state) => ({ auditHeat: Math.min(state.auditHeat + 1, 3) })),
  nextCase: () => set((state) => ({ caseIndex: state.caseIndex + 1 })),
  reset: () =>
    set({
      throughput: 36,
      deviationRate: 0,
      auditHeat: 0,
      accessLevel: 2,
      requestSignalUses: 2,
      compliance: 100,
      caseIndex: 0,
      decisions: {},
      justifications: {},
    }),
}));
