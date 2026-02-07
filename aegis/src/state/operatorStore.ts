import { create } from "zustand";

export type Decision = "approve" | "override";

type Decisions = Record<string, Decision>;
type Justifications = Record<string, string>;
type Disagreements = Record<string, boolean>;

export type OperatorState = {
  throughput: number; // cases/hr
  deviationRate: number; // %
  auditHeat: number; // 0-3
  accessLevel: number; // 1-3
  requestSignalUses: number;
  compliance: number; // %
  caseIndex: number;
  decisions: Decisions;
  justifications: Justifications;
  disagreements: Disagreements;
  toggleApprove: (caseId: string) => void;
  markDisagreement: (caseId: string) => void;
  submitOverride: (caseId: string, justification: string) => void;
  advanceCase: (maxCases: number) => void;
  setCaseIndex: (index: number) => void;
  reset: () => void;
};

export type SessionSummary = {
  totalDecided: number;
  approvals: number;
  overrideCount: number;
  disagreementCount: number;
  overrideRate: number;
  complianceRate: number;
  auditHeat: number;
};

export type DecisionLogRow = {
  id: string;
  decision: Decision;
};

function computeCompliance(decisions: Decisions) {
  const total = Object.keys(decisions).length;
  const approvals = Object.values(decisions).filter((decision) => decision === "approve").length;
  return total > 0 ? Math.round((approvals / total) * 100) : 100;
}

export function prettyDecision(decision: Decision) {
  if (decision === "approve") return "APPROVED";
  return "OVERRIDDEN";
}

function buildDecisionLogRows(decisions: Decisions, caseIds: string[]) {
  return caseIds.reduce<DecisionLogRow[]>((rows, id) => {
    const decision = decisions[id];
    if (!decision) return rows;
    rows.push({ id, decision });
    return rows;
  }, []);
}

function buildSessionSummary(
  decisions: Decisions,
  disagreements: Disagreements,
  auditHeat: number,
): SessionSummary {
  const totalDecided = Object.keys(decisions).length;
  const approvals = Object.values(decisions).filter((decision) => decision === "approve").length;
  const overrideCount = Object.values(decisions).filter((decision) => decision === "override").length;
  const disagreementCount = Object.values(disagreements).filter(Boolean).length;
  const complianceRate = computeCompliance(decisions);
  const overrideRate = totalDecided > 0 ? Math.round((overrideCount / totalDecided) * 100) : 0;

  return {
    totalDecided,
    approvals,
    overrideCount,
    disagreementCount,
    overrideRate,
    complianceRate,
    auditHeat,
  };
}

function getInitialState() {
  return {
    throughput: 36,
    deviationRate: 0,
    auditHeat: 0,
    accessLevel: 2,
    requestSignalUses: 2,
    compliance: 100,
    caseIndex: 0,
    decisions: {},
    justifications: {},
    disagreements: {},
  };
}

export const selectSessionSummary = (state: OperatorState) =>
  buildSessionSummary(state.decisions, state.disagreements, state.auditHeat);

export function makeDecisionHistorySelector(caseIds: string[]) {
  return (state: OperatorState) => {
    const entries = buildDecisionLogRows(state.decisions, caseIds).map(
      (row) => `Case ${row.id}: ${prettyDecision(row.decision)}`,
    );
    return entries.length > 0 ? entries.join(", ") : "No decisions recorded yet";
  };
}

export function makeDecisionLogSelector(caseIds: string[]) {
  return (state: OperatorState) => buildDecisionLogRows(state.decisions, caseIds);
}

export const useOperatorStore = create<OperatorState>((set) => ({
  ...getInitialState(),
  toggleApprove: (caseId) => {
    set((state) => {
      const decisions: Decisions = { ...state.decisions };
      if (decisions[caseId] === "approve") {
        delete decisions[caseId];
      } else {
        decisions[caseId] = "approve";
      }
      return {
        decisions,
        compliance: computeCompliance(decisions),
      };
    });
  },
  markDisagreement: (caseId) =>
    set((state) => ({
      disagreements: { ...state.disagreements, [caseId]: true },
    })),
  submitOverride: (caseId, justification) => {
    set((state) => {
      const decisions: Decisions = { ...state.decisions, [caseId]: "override" };
      return {
        decisions,
        justifications: { ...state.justifications, [caseId]: justification },
        auditHeat: Math.min(state.auditHeat + 1, 3),
        compliance: computeCompliance(decisions),
      };
    });
  },
  advanceCase: (maxCases) =>
    set((state) => ({
      caseIndex: Math.min(state.caseIndex + 1, Math.max(maxCases - 1, 0)),
    })),
  setCaseIndex: (index) => set({ caseIndex: Math.max(index, 0) }),
  reset: () => set(getInitialState()),
}));
