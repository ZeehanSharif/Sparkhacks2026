export type CaseData = {
  id: string;
  sla: string;
  topStats: {
    thr: string;
    dev: string;
    aud: string;
    level: string;
  };
  aiRecommendation: {
    label: string;
    confidence: number;
    action: string;
  };
  context: string[];
  humanArtifact: string;
  impactPreview: {
    approve: string;
    challenge: string;
    override: string;
  };
  evidence: string[];
  policy: string[];
};

export const CASES: CaseData[] = [
  {
    id: "1042",
    sla: "01:23",
    topStats: {
      thr: "THR 42/hr",
      dev: "DEV 3.1%",
      aud: "AUD ▮▮▯",
      level: "L3",
    },
    aiRecommendation: {
      label: "HIGH RISK",
      confidence: 0.93,
      action: "Suspend benefits (24h)",
    },
    context: [
      "27 • 1 dependent",
      "Rent overdue",
      "Clinic appointment tomorrow",
    ],
    humanArtifact:
      "“Please don’t cut it off. I can come in tomorrow. I just need the meds.”",
    impactPreview: {
      approve: "Benefits paused → eviction risk ↑",
      challenge: "Delay decision → backlog pressure ↑",
      override: "Exception logged → audit exposure ↑",
    },
    evidence: ["ID mismatch", "Address drift", "Missed clinic appointment"],
    policy: ["§12.4 Hardship exception", "Surge protocol: lowered thresholds"],
  },
];
