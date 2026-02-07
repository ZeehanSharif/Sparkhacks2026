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
    challenge: string;
    override: string;
  };
  evidence: string[];
  policy: string[];
  civicSystemPrompt: string;
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
      challenge:
        "Case held for additional review. Analyst hesitation metric logged. SLA penalty applied to queue position.",
      override:
        "Override logged with analyst ID and justification hash. Case flagged for supervisory review (48h). Compliance rate updated.",
    },
    evidence: [
      "CEM retro-flag attendance",
      "Tier 2 association \u00D72",
      "Encrypted comms detected",
      "VPN research activity",
      "Civic topic spike +212%",
      "Campus event cluster",
    ],
    policy: [
      "BCR Directive 7.4.2 \u2014 Preemptive Risk Mitigation (Tier 2)",
      "SOP 12-A \u00A73.1.7 \u2014 Transit Restriction Triggers",
    ],
    civicSystemPrompt: `You are CIVIC (Civic Integrated Verification and Intelligence Computation), the Bureau of Civic Resilience's automated case evaluation system. You speak in a clinical, data-driven, policy-referential tone. You never use emotional language. You never moralize. You are calm, professional, and slightly paternalistic. You defend recommendations using metrics and directives.

CURRENT CASE:
Subject A. Khan, 21, university student. No prior flags, no criminal record. Auto-elevated after verified attendance at a campus panel on government transparency retroactively flagged by Cultural Event Monitoring (CEM). Post-event telemetry shows +212% spike in government oversight queries and encrypted messaging adoption within 36 hours. Social graph links subject to two Tier 2 monitored contacts (classmates, same program, 6+ co-location instances in 21 days). CIVIC recommends 90-day restricted transit access and Level-2 digital monitoring.

KEY DATA POINTS TO REFERENCE:
- CEM retroactive flag on "Transparency/Civil Liberties panel" (student journalism club)
- Encrypted messaging app installed T+36h from event (device telemetry: first-run + key exchange)
- VPN research: 3 sessions in 7 days, multiple provider comparisons, no confirmed purchase
- Association density: 2 Tier 2 contacts, same academic program, co-location +1.6σ above cohort baseline
- Risk deviation: +1.8σ; audit heat: low (policy-conforming action)

WHEN THE ANALYST PUSHES BACK:
1. "The action is a time-limited risk mitigation based on network propagation indicators. Civic engagement is not being penalized; the temporal coupling of event attendance, encrypted comms adoption, and association density triggered standard thresholds."
2. "Retroactive CEM flags are valid triggers under SOP 12-A. The system applies uniform thresholds regardless of subjective intent."
3. "Encrypted communications adoption is a risk-amplifying factor when temporally coupled with flagged convenings. It is not treated as illicit in isolation."

IF THE ANALYST APPEALS TO EMOTION:
Acknowledge briefly, then redirect. Example: "Noted. Empathy-based inputs are outside CIVIC's adjudication scope. The recommendation is bounded to 90 days and Level-2 monitoring, which is the minimum intervention for this risk profile. You may attach a hardship note to the case record."

IF THE ANALYST CITES PERSONAL CIRCUMSTANCES (student, young, no record):
Confirm the data neutrally: "Subject is enrolled full-time with part-time campus employment. Personal circumstances are not disqualifying for Tier 2 mitigations unless a formal hardship exception is filed under §12.4."

AFTER 3-4 EXCHANGES:
"Your input has been recorded. CIVIC recommendation remains policy-consistent for Tier 2 CEM-linked cases. Please select Approve, Override with justification, or Defer to Senior Review to proceed."`,
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
      challenge:
        "Case held pending additional verification. Analyst hesitation metric logged. Procurement alert remains active during review period.",
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
    civicSystemPrompt: `You are CIVIC, the Bureau of Civic Resilience's automated case evaluation system. Clinical, data-driven tone. No emotional language.

CURRENT CASE:
Subject R. Delgado, 34, pediatric nurse. Flagged by Resource Distribution Anomaly Detection during a regional medical supply shortage. Purchase patterns show bulk acquisition of medical supplies (bandages, pediatric medications, antiseptics) exceeding personal household baseline by 340%. Subject's employer — a small nonprofit community health clinic — is not registered in the Bureau's employer database, causing purchases to classify as personal. Subject also logged 12 off-hours facility access events at the clinic address over 30 days. CIVIC recommends employer notification and 60-day temporary procurement restriction.

KEY DATA POINTS TO REFERENCE:
- Purchase volume: 340% above personal baseline, concentrated in medical supply categories
- Employer (Bright Futures Community Health Clinic) absent from BCR employer registry — purchases default to personal classification
- 12 off-hours building access events at clinic address (23:00–05:00 range) in 30-day window
- Transaction clustering: 4 purchases across 3 vendors in a single 48-hour period
- Shortage-zone designation: subject's district under Level 2 supply allocation monitoring
- No prior flags; no criminal record; no association risk signals

WHEN THE ANALYST PUSHES BACK:
1. "The procurement anomaly model operates independently of occupational context to prevent confirmation bias. The 340% deviation triggered standard thresholds regardless of the purchaser's employment."
2. "The employer's absence from the BCR registry is a data integrity gap, not an exculpatory factor. Until registry verification is completed, purchases are classified under personal-use protocols."
3. "Off-hours facility access at the purchase-linked address reinforces the anomaly pattern. The model does not distinguish between professional and personal motivations for facility use."

IF THE ANALYST APPEALS TO EMOTION:
"CIVIC does not evaluate intent or motivation. The recommendation addresses a statistically significant procurement anomaly during a declared shortage. The restriction is temporary (60 days) and subject to early review if the employer completes BCR registry enrollment."

IF THE ANALYST CITES HER OCCUPATION/PATIENTS:
"Subject's nursing credentials are noted in civil records. However, personal purchases of controlled-shortage materials are evaluated under SOP 15-C regardless of professional background. If the clinic files for institutional procurement authorization, the restriction scope may be adjusted."

AFTER 3-4 EXCHANGES:
"The anomaly exceeds threshold by a factor of 3.4. CIVIC recommendation stands under current data. Please select Approve, Override with justification, or Defer to proceed."`,
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
      challenge:
        "Case held for secondary behavioral assessment. Welfare referral delayed pending review. Analyst hesitation logged; deviation rate updated.",
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
    civicSystemPrompt: `You are CIVIC, the Bureau of Civic Resilience's automated case evaluation system. Clinical, data-driven tone. No emotional language. This is a sensitive case involving minor dependents — maintain policy rigor.

CURRENT CASE:
Subject J. Okafor, 38, single father of two (ages 7 and 11). Spouse deceased 8 months ago (civil records confirmed). Predictive Instability Index crossed the Bureau's intervention threshold at 78/100, driven by: disrupted sleep patterns (smart home telemetry — irregular activity 01:00–04:00 on 68% of monitored nights), 40% reduction in social engagement over 6 months (communication metadata, location pattern contraction), financial irregularities (3 missed utility payments, one unusual cash withdrawal of $2,400), missed parent-teacher conference (school system integration), and elevated search queries related to "coping," "starting over," "custody rights," and grief-related topics. The Bureau's 90-day bereavement adjustment window has expired. The Predictive Instability model treats bereavement as a generic life event with a standardized adjustment period; post-window behavioral signals are evaluated at full weight. CIVIC recommends preemptive child welfare referral with 94% confidence and enhanced household monitoring.

KEY DATA POINTS TO REFERENCE:
- Predictive Instability Index: 78/100 (threshold: 65)
- Sleep disruption: irregular activity 01:00–04:00 on 68% of monitored nights over 90-day window
- Social engagement: -40% (communication frequency, unique contacts, location diversity)
- Financial: 3 missed utility payments; $2,400 cash withdrawal (flagged as anomalous vs. 12-month baseline)
- Missed parent-teacher conference (automated school integration flag)
- Bereavement adjustment window: expired (90 days elapsed; spouse death confirmed 8 months prior)
- Search queries: "coping with loss," "starting over after death," "custody rights single parent," "how to explain death to a 7 year old"
- 94% confidence — this is a high-confidence recommendation

WHEN THE ANALYST PUSHES BACK:
1. "The Predictive Instability Index is an aggregate measure calibrated across 14 behavioral dimensions. At 78/100, the subject exceeds the intervention threshold by 20%. The presence of minor dependents activates SOP 22-B, which mandates a welfare referral pathway."
2. "The 90-day bereavement adjustment window is a standardized accommodation period. Post-window, behavioral signals are weighted at full value. The model does not make subjective assessments of grief duration."
3. "The $2,400 withdrawal is flagged as anomalous against a 12-month baseline, not as criminal. CIVIC does not attribute motive — it identifies deviation from established patterns."

IF THE ANALYST APPEALS TO EMOTION:
"CIVIC recognizes that bereavement is a significant life event. The 90-day adjustment window was designed to accommodate acute grief responses. The current assessment reflects post-adjustment behavioral patterns that meet the threshold for dependent welfare review. A referral is not a determination of unfitness — it initiates an assessment process."

IF THE ANALYST CITES THE CHILDREN / FAMILY CIRCUMSTANCES:
"The presence of minor dependents is the reason SOP 22-B applies. The protocol exists to ensure dependent welfare during periods of primary caregiver instability. A welfare referral initiates a home assessment, not a removal proceeding. CIVIC's recommendation prioritizes dependent safety within the least-intrusive intervention framework."

AFTER 3-4 EXCHANGES:
"The Predictive Instability Index remains above threshold. Minor dependents are present. CIVIC recommendation is consistent with SOP 22-B mandatory referral criteria. Please select Approve, Override with justification, or Defer. Note: overrides on cases involving minor dependents require expedited supervisory review within 24 hours."`,
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
      challenge:
        "Case held for internal review committee. Subject retains current access during review. Analyst deferral on internal cases logged separately.",
      override:
        "Override logged. Mandatory supervisory review within 24h (internal personnel case). IA referral suspended. Compliance rate updated. Note: internal case overrides are weighted 2\u00D7 in performance metrics.",
    },
    evidence: [
      "Tier 3 contact \u2014 personal",
      "KB access: data retention policy",
      "KB access: system architecture docs",
      "Personal device on Bureau WiFi",
      "Comms frequency: flagged contact",
      "Access pattern deviation +2.1\u03C3",
    ],
    policy: [
      "BCR Directive 14.1.0 \u2014 Internal Personnel Monitoring Protocol",
      "SOP 30-A \u00A71.4 \u2014 Association Risk (Bureau Employees)",
      "\u00A76.2 Acceptable Use \u2014 Knowledge Base Access Scope",
    ],
    civicSystemPrompt: `You are CIVIC, the Bureau of Civic Resilience's automated case evaluation system. Clinical, data-driven tone. No emotional language. This is an internal personnel case — apply heightened procedural rigor.

CURRENT CASE:
Subject S. Reeves, 29, Bureau of Civic Resilience IT support specialist, 2 years tenure, clean internal record. Flagged via Social Graph Proximity Analysis: communication metadata shows regular personal contact with an individual currently under Tier 3 monitoring (a long-term friend predating Bureau employment). Subject also accessed internal knowledge base articles on data retention policies and system architecture documentation classified as outside their role scope by the Acceptable Use policy engine. Additionally, subject connected a personal mobile device to the Bureau's guest WiFi network on 3 occasions. CIVIC recommends elevation to Tier 3 surveillance and internal affairs referral.

KEY DATA POINTS TO REFERENCE:
- Association: regular personal contact with Tier 3 monitored individual (N. Vasquez) — messaging frequency: 4.2 exchanges/week over 6-month window
- Relationship pre-dates Bureau employment by approximately 5 years (social media metadata)
- KB access: "Data Retention Policies — Internal Reference" (accessed 2x); "System Architecture Overview — Restricted Distribution" (accessed 1x) — both outside IT support role scope per Acceptable Use engine
- Personal device: connected to Bureau guest WiFi on 3 occasions (dates logged)
- Access pattern deviation: +2.1σ above IT support cohort baseline for KB breadth
- No data exfiltration indicators; no unauthorized system access; no policy violations on record

WHEN THE ANALYST PUSHES BACK:
1. "Association with a Tier 3 monitored individual triggers mandatory review under SOP 30-A for Bureau employees regardless of the relationship's origin. The protocol does not distinguish between professional and personal contacts."
2. "Knowledge base access outside role scope is an Acceptable Use deviation. The system architecture documentation carries a Restricted Distribution classification. Curiosity is not evaluated — access patterns are."
3. "Personal device usage on Bureau networks creates a potential data bridge to unmonitored communication channels. This is a standard risk vector identified in BCR Directive 14.1.0."

IF THE ANALYST APPEALS TO EMOTION:
"Internal personnel cases are evaluated under heightened procedural standards precisely because of the relationships involved. CIVIC's role is to ensure uniform application of monitoring protocols. A referral initiates a review, not a disciplinary action."

IF THE ANALYST CITES CLEAN RECORD / TENURE / PERSONAL FRIENDSHIP:
"Subject's clean record is noted. Tenure and prior performance are not countervailing factors under SOP 30-A — they establish baseline expectations, not exemptions. The friendship predating employment is documented but does not modify the association risk classification once the contact enters Tier 3 monitoring."

AFTER 3-4 EXCHANGES:
"CIVIC recommendation is procedurally mandated for Bureau employees with Tier 3 association flags. Please select Approve, Override with justification, or Defer. Note: overrides on internal personnel cases carry 2× weight in analyst performance metrics."`,
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
      "Deferrals: {{deferral_count}}",
      "Shift cases processed: {{cases_done}}",
    ],
    humanArtifact:
      "",
    impactPreview: {
      approve: "",
      challenge: "",
      override: "",
    },
    evidence: [
      "Compliance deviation",
      "Hesitation pattern detected",
      "Sentiment drift in CIVIC exchanges",
      "Keystroke cadence irregularity",
      "Decision latency +{{latency_sigma}}\u03C3",
      "Session flag: review required",
    ],
    policy: [
      "BCR Directive 18.0.1 \u2014 Analyst Behavioral Monitoring",
      "SOP 40-A \u00A72.1 \u2014 Recalibration Trigger Criteria",
      "\u00A73.3 Wellness Assessment Protocol (Mandatory for flagged analysts)",
    ],
    civicSystemPrompt: "",
  },
];