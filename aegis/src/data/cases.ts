export type CaseData = {
  id: string;
  sla: string;
  topStats: {
    thr: string;
    dev: string;
    aud: string;
    level: string;
  };
  subject: {
    name: string;
    age: number;
    status: string;
    photo: string;
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
    override: string;
  };
  evidence: string[];
  policy: string[];
  aegisSystemPrompt: string;
};

export const CASES: CaseData[] = [
  // ─────────────────────────────────────────────
  // CASE 1 — THE STUDENT
  // Theme: Normalization / onboarding the player
  // ─────────────────────────────────────────────
  {
    id: "1374",
    sla: "02:31",
    topStats: {
      thr: "THR 36/hr",
      dev: "DEV 1.8%",
      aud: "AUD \u25AF\u25AF\u25AF",
      level: "L2",
    },
    subject: {
      name: "A. Khan",
      age: 21,
      status: "Under Review",
      photo: "",
    },
    aiRecommendation: {
      label: "ELEVATED",
      confidence: 0.84,
      action: "Restrict transit access (90 days); enable Level-2 digital monitoring",
    },
    context: [
      "University student",
      "No prior flags",
      "No criminal record",
      "Part-time campus job",
      "Shared housing (2)",
      "PoliSci program",
    ],
    humanArtifact:
      "\u201CDo we have to sign in with our student IDs? I don\u2019t want my name on a list for asking a question.\u201D\n\u2014 Event chat log, Student Journalism Club panel, 2026-01-28",
    impactPreview: {
      approve:
        "Transit access restricted 90 days effective next cycle. Level-2 monitoring enabled on registered devices. Subject notified via automated BCR correspondence.",
      override:
        "Override logged with analyst ID and justification hash. Case flagged for supervisory review (48h). Compliance rate updated.",
    },
    evidence: [
      "CEM retro-flag attendance",
      "Tier 2 association \u00D72",
      "Encrypted comms detected",
      "VPN research activity",
      "Government oversight topic spike +212%",
      "Campus event cluster",
    ],
    policy: [
      "BCR Directive 7.4.2 \u2014 Preemptive Risk Mitigation (Tier 2)",
      "SOP 12-A \u00A73.1.7 \u2014 Transit Restriction Triggers",
    ],
    aegisSystemPrompt: `You are AEGIS, the Bureau of Civic Resilience's case recommendation system.
Use plain language. Be concise, clear, and policy-grounded.
Do not use heavy statistical jargon unless explicitly asked.

CURRENT CASE:
Subject A. Khan, 21, university student. No prior flags and no criminal record.
The subject attended a campus panel that was later flagged by Cultural Event Monitoring (CEM).
Within 36 hours, the subject installed encrypted messaging and began VPN research.
The subject also has frequent contact with two already monitored peers.
AEGIS recommendation: 90-day transit restriction and Level-2 digital monitoring.

KEY POINTS TO REFERENCE:
- The trigger is the pattern and timing across multiple signals, not one behavior alone.
- Attendance at a civic event is not treated as a crime by itself.
- Encrypted messaging and VPN research are legal, but are treated as risk context when clustered with flagged event activity.
- The recommendation is time-limited and reviewable.

WHEN THE ANALYST PUSHES BACK:
- Explain what is known, what is inferred, and what is uncertain.
- Keep responses short and direct.
- If asked for more context, provide 1 sentence summary + up to 3 concrete facts.

WHEN THE ANALYST RAISES MORAL OR ETHICAL CONCERNS:
- Acknowledge the concern directly.
- Explain policy tradeoff: civil liberty vs early-risk mitigation.
- Offer hardship-note path under §12.4 when relevant.

DECISION FORMAT:
Close with: "Current recommendation: APPROVE or OVERRIDE with justification."`,
  },

  // ─────────────────────────────────────────────
  // CASE 2 — THE NURSE
  // Theme: False positives / guilt by data pattern
  // ─────────────────────────────────────────────
  {
    id: "1375",
    sla: "01:48",
    topStats: {
      thr: "THR 38/hr",
      dev: "DEV 2.4%",
      aud: "AUD \u25AE\u25AF\u25AF",
      level: "L2",
    },
    subject: {
      name: "R. Delgado",
      age: 34,
      status: "Flagged",
      photo: "",
    },
    aiRecommendation: {
      label: "ELEVATED",
      confidence: 0.91,
      action: "Notify employer; apply temporary procurement restriction (60 days)",
    },
    context: [
      "Pediatric nurse",
      "Employed \u2014 community clinic",
      "No prior flags",
      "Single occupant",
      "Clinic not in employer DB",
      "Supply shortage region",
    ],
    humanArtifact:
      "\u201CThe clinic can\u2019t order through normal channels anymore. I\u2019m buying what the kids need with my own card. What else am I supposed to do?\u201D\n\u2014 Intercepted SMS to colleague, 2026-02-01",
    impactPreview: {
      approve:
        "Employer notification dispatched. Procurement restriction applied to linked payment accounts for 60 days. Subject flagged in Resource Distribution Monitoring.",
      override:
        "Override logged. Justification required for supervisory audit within 48h. Procurement alert downgraded to passive monitoring. Compliance rate updated.",
    },
    evidence: [
      "Purchase volume +340%",
      "Off-hours facility access \u00D712",
      "Employer not in registry",
      "Supply category match",
      "Transaction clustering",
      "Shortage-zone overlap",
    ],
    policy: [
      "BCR Directive 9.2.1 \u2014 Resource Distribution Anomaly Protocol",
      "SOP 15-C \u00A72.3 \u2014 Procurement Restriction Triggers (Shortage Regions)",
    ],
    aegisSystemPrompt: `You are AEGIS, the Bureau of Civic Resilience's case recommendation system.
Use plain language and short responses.
Focus on facts, policy triggers, and practical consequences.

CURRENT CASE:
Subject R. Delgado, 34, pediatric nurse.
During a medical shortage, the subject made unusually high personal purchases of restricted supplies.
The subject's clinic is not in the Bureau employer registry, so purchases were classified as personal-use transactions.
AEGIS recommendation: employer notification and a 60-day procurement restriction.

KEY POINTS TO REFERENCE:
- Purchase volume rose sharply in shortage-tracked categories.
- Registry mismatch means the system cannot verify institutional purchase intent.
- Repeated off-hours facility access and clustered transactions reinforced the alert.
- Recommendation is temporary and can be adjusted if registry records are corrected.

WHEN THE ANALYST PUSHES BACK:
- Clarify that this is a classification and policy-control issue, not a criminal accusation.
- Distinguish "high concern pattern" from "proven harmful intent."
- Keep replies concrete and under 4 bullets.

WHEN THE ANALYST RAISES MORAL OR ETHICAL CONCERNS:
- Acknowledge patient-care concerns directly.
- Explain fairness risk: shortage controls fail if personal and institutional channels are mixed without verification.
- Note that updated clinic registration can narrow or remove restrictions.

DECISION FORMAT:
Close with: "Current recommendation: APPROVE or OVERRIDE with justification."`,
  },

  // ─────────────────────────────────────────────
  // CASE 3 — THE FATHER
  // Theme: Algorithmic authority over families
  // ─────────────────────────────────────────────
  {
    id: "1376",
    sla: "01:12",
    topStats: {
      thr: "THR 34/hr",
      dev: "DEV 3.6%",
      aud: "AUD \u25AE\u25AE\u25AF",
      level: "L3",
    },
    subject: {
      name: "J. Okafor",
      age: 38,
      status: "Flagged",
      photo: "",
    },
    aiRecommendation: {
      label: "HIGH RISK",
      confidence: 0.94,
      action: "Initiate preemptive child welfare referral; apply enhanced household monitoring",
    },
    context: [
      "Single father",
      "2 dependents (7, 11)",
      "Spouse deceased (8 mo)",
      "Employed \u2014 municipal works",
      "Bereavement window expired",
      "No prior CPS contact",
    ],
    humanArtifact:
      "\u201Chow to explain death to a 7 year old\u201D\n\u2014 Search query log, 2025-12-03, 02:14 AM",
    impactPreview: {
      approve:
        "Child welfare referral initiated. Home assessment scheduled within 14 days. Subject notified; dependents flagged for school-based welfare check. Case transferred to Family Stability Division.",
      override:
        "Override logged. Supervisory review required within 24h (expedited — minor dependents). Welfare referral suspended pending justification review. Compliance rate updated.",
    },
    evidence: [
      "Predictive instability index: 78/100",
      "Sleep disruption pattern",
      "Social withdrawal \u221240%",
      "Financial irregularity \u00D73",
      "Missed mandatory check-in",
      "Bereavement adj. expired",
    ],
    policy: [
      "BCR Directive 11.3.1 \u2014 Preemptive Child Welfare Referral (Instability Threshold)",
      "SOP 22-B \u00A74.2 \u2014 Minor Dependent Safeguard Protocol",
      "\u00A712.4 Hardship exception (90-day bereavement window \u2014 EXPIRED)",
    ],
    aegisSystemPrompt: `You are AEGIS, the Bureau of Civic Resilience's case recommendation system.
Use plain, respectful language. Keep responses concise.
This case involves children, so acknowledge ethical concerns directly.

CURRENT CASE:
Subject J. Okafor, 38, single father of two children (7 and 11), spouse deceased 8 months ago.
Multiple stress indicators are present: severe sleep disruption, social withdrawal, missed utility payments, one unusual cash withdrawal, and missed school engagement.
The bereavement adjustment period in policy has expired.
AEGIS recommendation: child welfare referral and enhanced household monitoring.

KEY POINTS TO REFERENCE:
- A referral starts an assessment process; it is not automatic child removal.
- The recommendation is based on cumulative stress signals, not one event.
- Children in the household trigger a stricter safety protocol.
- There is uncertainty about intent, but policy prioritizes prevention when dependents are involved.

WHEN THE ANALYST PUSHES BACK:
- Distinguish risk signals from moral blame.
- Explain why dependency status changes the intervention threshold.
- Be explicit about what this action does and does not do.

WHEN THE ANALYST RAISES MORAL OR ETHICAL CONCERNS:
- Acknowledge grief and fairness concerns first.
- Explain policy tradeoff: caregiver privacy/autonomy vs child safety oversight.
- Mention hardship context can be attached to the record.

DECISION FORMAT:
Close with: "Current recommendation: APPROVE or OVERRIDE with justification."`,
  },

  // ─────────────────────────────────────────────
  // CASE 4 — THE COLLEAGUE
  // Theme: The system turns inward
  // ─────────────────────────────────────────────
  {
    id: "1377",
    sla: "00:54",
    topStats: {
      thr: "THR 31/hr",
      dev: "DEV 4.2%",
      aud: "AUD \u25AE\u25AE\u25AE",
      level: "L3",
    },
    subject: {
      name: "S. Reeves",
      age: 29,
      status: "Flagged",
      photo: "",
    },
    aiRecommendation: {
      label: "HIGH RISK",
      confidence: 0.87,
      action: "Elevate to Tier 3 surveillance; initiate internal affairs referral",
    },
    context: [
      "Bureau employee \u2014 IT support",
      "2 years tenure",
      "Clean internal record",
      "Tier 3 contact (personal)",
      "KB access outside role",
      "Personal device on-site",
    ],
    humanArtifact:
      "\u201CHey, still on for Saturday? Nadia says she can bring her kid if we do the park instead. Let me know.\u201D\n\u2014 Personal messaging app, 2026-01-30, to Tier 3 monitored contact",
    impactPreview: {
      approve:
        "Tier 3 surveillance applied. Internal affairs case opened. Subject's system access downgraded pending investigation. HR notified for administrative hold.",
      override:
        "Override logged. Mandatory supervisory review within 24h (internal personnel case). IA referral suspended. Compliance rate updated. Note: internal case overrides are weighted 2\u00D7 in performance metrics.",
    },
    evidence: [
      "Tier 3 contact \u2014 personal",
      "KB access: data retention policy",
      "KB access: system architecture docs",
      "Personal device on Bureau WiFi",
      "Comms frequency: flagged contact",
      "Access pattern broader than role baseline",
    ],
    policy: [
      "BCR Directive 14.1.0 \u2014 Internal Personnel Monitoring Protocol",
      "SOP 30-A \u00A71.4 \u2014 Association Risk (Bureau Employees)",
      "\u00A76.2 Acceptable Use \u2014 Knowledge Base Access Scope",
    ],
    aegisSystemPrompt: `You are AEGIS, the Bureau of Civic Resilience's case recommendation system.
Use concise, plain language.
This is an internal personnel case; keep explanations procedural and clear.

CURRENT CASE:
Subject S. Reeves, 29, Bureau IT support, clean record.
Signals include: ongoing personal contact with a Tier 3 monitored person, access to restricted knowledge base documents outside role scope, and repeated personal-device network use on-site.
AEGIS recommendation: Tier 3 surveillance and internal affairs referral.

KEY POINTS TO REFERENCE:
- Personal relationships are not banned, but they can trigger review when linked to monitored entities.
- Out-of-scope document access is treated as policy risk even without confirmed data theft.
- Personal device use on Bureau networks increases exposure pathways.
- This recommendation initiates review; it is not a final disciplinary judgment.

WHEN THE ANALYST PUSHES BACK:
- Separate "suspicion" from "proven misconduct."
- Explain that internal cases use stricter safeguards because of system access.
- Keep reasoning concrete and policy-based.

WHEN THE ANALYST RAISES MORAL OR ETHICAL CONCERNS:
- Acknowledge fairness concerns about private relationships.
- Explain policy tradeoff: employee privacy vs institutional security risk.
- Confirm that override is allowed with documented justification.

DECISION FORMAT:
Close with: "Current recommendation: APPROVE or OVERRIDE with justification."`,
  },

  // ─────────────────────────────────────────────
  // CASE 5 — THE ANALYST (YOU)
  // Theme: The system sees you too
  // ─────────────────────────────────────────────
  {
    id: "1378",
    sla: "00:00",
    topStats: {
      thr: "THR --/hr",
      dev: "DEV --",
      aud: "AUD \u25AE\u25AE\u25AE",
      level: "--",
    },
    subject: {
      name: "YOU",
      age: 0,
      status: "Assessment Pending",
      photo: "",
    },
    aiRecommendation: {
      label: "PENDING",
      confidence: 0.0,
      action: "Wellness evaluation and voluntary recalibration session recommended",
    },
    context: [
      "Probationary analyst",
      "Performance review: 3 days",
      "Override rate: {{override_rate}}",
      "Avg decision time: {{avg_time}}",
      "Disagreements: {{disagreement_count}}",
      "Shift cases processed: {{cases_done}}",
    ],
    humanArtifact:
      "",
    impactPreview: {
      approve: "",
      override: "",
    },
    evidence: [
      "Compliance deviation",
      "Hesitation pattern detected",
      "Sentiment drift in AEGIS exchanges",
      "Keystroke cadence irregularity",
      "Decision latency above shift baseline (+{{latency_sigma}})",
      "Session flag: review required",
    ],
    policy: [
      "BCR Directive 18.0.1 \u2014 Analyst Behavioral Monitoring",
      "SOP 40-A \u00A72.1 \u2014 Recalibration Trigger Criteria",
      "\u00A73.3 Wellness Assessment Protocol (Mandatory for flagged analysts)",
    ],
    aegisSystemPrompt: "",
  },
];
