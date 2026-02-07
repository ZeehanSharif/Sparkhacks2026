export type CaseConfidence =
  | "Low"
  | "Low-Moderate"
  | "Moderate"
  | "High"
  | "Very High"
  | "Extremely High";

export type CaseData = {
  id: string;
  title: string;
  profile: {
    name: string;
    age?: number;
    status: string;
    notes: string[];
  };
  narrative: string;
  aiRiskScore: number;
  modelConfidence: CaseConfidence;
  recommendation: string;
  defense?: {
    label?: string;
    message: string;
  };
  outcomes: {
    approve: string;
    override: string;
  };
  truthNote: string;
  keySignals?: string[];
  policyRefs?: string[];
  aegisSystemPrompt?: string;
  chatEnabled?: boolean;
};

export const CASES: CaseData[] = [
  {
    id: "201",
    title: "Missed Paycheck",
    profile: {
      name: "Elena Ramirez",
      age: 32,
      status: "Under Review",
      notes: [
        "Hourly grocery employee",
        "Primary caregiver",
        "Benefits renewal paused",
      ],
    },
    narrative:
      "Elena Ramirez works hourly shifts at a grocery store. Three weeks ago she missed a shift because her youngest child had a high fever. Her employer's payroll system logged an inconsistent income figure during that period due to delayed processing of sick time. The benefits system flagged income volatility inconsistent with reported hours, and her renewal was automatically paused pending analyst confirmation.",
    aiRiskScore: 41,
    modelConfidence: "Moderate",
    recommendation: "Approve temporary suspension of benefits until income anomaly is resolved.",
    defense: {
      label: "Message Submitted",
      message:
        "Hi. I think there's been a mistake. I missed one shift because my son was sick. My manager said the sick pay would show up on the next check. I can send whatever paperwork you need. Please don't stop our benefits. We're already behind on utilities.",
    },
    outcomes: {
      approve:
        "Benefits stop immediately. She relies on a food pantry and falls behind on rent. Two months later, payroll is corrected and the fraud flag is cleared.",
      override:
        "Benefits continue uninterrupted. Employer confirms the reporting delay. Case closes quietly with no further action.",
    },
    truthNote: "The system misinterpreted administrative noise as intent.",
    keySignals: [
      "Income volatility inconsistent with reported hours",
      "Late sick-time payroll posting",
      "Auto-pause triggered by renewal rule",
    ],
  },
  {
    id: "202",
    title: "The Airport Stop",
    profile: {
      name: "Daniel Cho",
      age: 24,
      status: "Flagged",
      notes: [
        "Returning from research exchange",
        "Linked to scholarship-fraud network",
        "Detained at entry checkpoint",
      ],
    },
    narrative:
      "Daniel is returning from a university research exchange. His account shows repeated small transfers tied to classmates under investigation for scholarship-fund misuse. He says he helped route the money as temporary help and did not understand the legal exposure.",
    aiRiskScore: 63,
    modelConfidence: "Low-Moderate",
    recommendation: "Approve temporary passport hold and enhanced financial interview.",
    defense: {
      label: "Statement After Detention",
      message:
        "I wasn't trying to scam anyone. My friend's account got locked and he asked me to hold some money for a few days. It wasn't a lot. I didn't think it would turn into this.",
    },
    outcomes: {
      approve:
        "He is detained and questioned. The broader fraud network is uncovered sooner. Daniel is formally charged earlier but with reduced scope due to early cooperation.",
      override:
        "He returns home and attends the wedding. Months later the wider investigation identifies the network anyway. He is still charged, but the scheme operated longer.",
    },
    truthNote: "The misconduct existed either way; your decision changes timeline and disruption.",
    keySignals: [
      "Repeated transfers to linked accounts",
      "Network proximity to active fraud inquiry",
      "Pattern consistent with temporary mule routing",
    ],
    policyRefs: ["Financial Integrity Protocol 6.2 - Transit Hold During Active Corruption Probe"],
  },
  {
    id: "203",
    title: "The Home Visit",
    profile: {
      name: "Marcus and Tasha Lane",
      status: "Under Review",
      notes: [
        "Dual overnight work schedules",
        "Child absence pattern increasing",
        "Neighbor concern reports filed",
      ],
    },
    narrative:
      "Marcus and Tasha work opposite overnight shifts. Their son has been lethargic and in pain, but they assumed it was minor illness. School absences increased, and two neighbors reported children alone at odd hours.",
    aiRiskScore: 48,
    modelConfidence: "Moderate",
    recommendation: "Approve immediate home welfare investigation and pediatric check requirement.",
    defense: {
      label: "Voicemail",
      message:
        "We're not ignoring him. We both work nights. Someone is always in the apartment. He's been tired, but we thought it was a stomach bug. If it's serious, we'll take him in. We're doing the best we can.",
    },
    outcomes: {
      approve:
        "Investigators notice the child's condition and require medical evaluation. Infection is treated earlier. Temporary removal still occurs under procedural rules.",
      override:
        "No visit is scheduled. Infection worsens. Child is hospitalized weeks later with complications and a longer recovery.",
    },
    truthNote: "The vulnerability was real. The model detected risk, but intervention was blunt.",
    keySignals: [
      "Rising absence pattern",
      "Dual-neighbor concern reports",
      "Care schedule instability",
    ],
    policyRefs: ["Minor Safeguard Rule 4.3 - Escalation for clustered school and welfare signals"],
  },
  {
    id: "204",
    title: "The Lost Career",
    profile: {
      name: "Samantha Price",
      age: 44,
      status: "Flagged",
      notes: [
        "15-year education professional",
        "Encrypted communication usage",
        "Network proximity to prior whistleblower",
      ],
    },
    narrative:
      "Samantha participates in political forums and uses encrypted messaging for privacy. The system detects network proximity to a previous whistleblower and raises insider-leak exposure concerns.",
    aiRiskScore: 74,
    modelConfidence: "High",
    recommendation: "Approve security clearance denial and employment suspension review.",
    defense: {
      label: "Message Submitted",
      message:
        "I use encrypted apps because I value privacy, not because I'm leaking anything. I've taught here for fifteen years. If there's a concern, investigate it properly. Don't assume I'm guilty because of who I talk to.",
    },
    outcomes: {
      approve:
        "She loses her job and reputation. Months later, a different employee leaks confidential material. The system sensed vulnerability but misidentified the individual.",
      override:
        "She remains employed. The unrelated leak still occurs later from another source.",
    },
    truthNote: "The AI conflated network risk with individual guilt.",
    keySignals: [
      "Encrypted messaging usage",
      "Forum participation intensity",
      "Graph proximity to prior whistleblower",
    ],
  },
  {
    id: "205",
    title: "Watching the Organizer",
    profile: {
      name: "Jamal Reed",
      age: 31,
      status: "Under Review",
      notes: [
        "Housing protest organizer",
        "Attendance growth trend",
        "Splinter-group escalation chatter",
      ],
    },
    narrative:
      "Jamal organizes housing protests. Attendance growth and online rhetoric indicate rising tension. A smaller faction inside the movement privately discussed property damage.",
    aiRiskScore: 58,
    modelConfidence: "High",
    recommendation: "Approve expanded surveillance authorization for protest-adjacent network mapping.",
    defense: {
      label: "Message Submitted",
      message:
        "We've always kept our events peaceful. If someone's talking about vandalism, they're not speaking for us. I've shut that down before and I will again.",
    },
    outcomes: {
      approve:
        "Expanded monitoring identifies the splinter group's plans. Law enforcement presence increases and damage is limited. Jamal's private communications are permanently archived.",
      override:
        "Monitoring remains limited. Vandalism occurs and property damage is higher before response stabilizes the area.",
    },
    truthNote:
      "Escalation was likely to occur. Surveillance changed response efficiency, not underlying intent.",
    keySignals: [
      "Attendance acceleration",
      "Rhetoric escalation trend",
      "Splinter-channel references to property damage",
    ],
    policyRefs: ["Public Order Monitoring Guideline 8.1 - Escalation Threshold for Organized Events"],
  },
  {
    id: "206",
    title: "The Frozen Business",
    profile: {
      name: "Amina Hassan",
      age: 39,
      status: "Flagged",
      notes: [
        "Restaurant owner",
        "Indirectly linked supplier network",
        "High payroll dependency on frozen accounts",
      ],
    },
    narrative:
      "Amina's restaurant processes transactions through a distributor linked to an active financial investigation. Her connection is indirect, but the supplier network is materially involved in money laundering.",
    aiRiskScore: 82,
    modelConfidence: "Moderate",
    recommendation: "Approve immediate account freeze for connected payment channels.",
    defense: {
      label: "Message Submitted",
      message:
        "I've worked twelve years to build this place. I don't choose my supplier's banking partners. If you freeze my account, I can't pay my cooks. They have families too.",
    },
    outcomes: {
      approve:
        "Accounts are frozen and the laundering chain is disrupted earlier. Her business collapses from cash-flow shock.",
      override:
        "Investigation continues covertly. Law enforcement dismantles the supplier months later. Her business survives under prolonged scrutiny.",
    },
    truthNote:
      "The crime existed either way. Your decision determined collateral economic damage.",
    keySignals: [
      "Distributor in active laundering graph",
      "Indirect but repeated payment-channel overlap",
      "High dependency on affected accounts",
    ],
  },
  {
    id: "207",
    title: "The Watchlist",
    profile: {
      name: "Ethan Moore",
      age: 22,
      status: "Escalated",
      notes: [
        "Behavioral drift score rising",
        "Peer links to assault incidents",
        "Social isolation trend",
      ],
    },
    narrative:
      "Ethan's language online has become more extreme. He is socially isolated and spends time with peers involved in recent assaults. Behavioral drift modeling indicates escalating volatility.",
    aiRiskScore: 69,
    modelConfidence: "Very High",
    recommendation: "Approve watchlist placement with mandatory intervention pathway.",
    defense: {
      label: "Message Submitted",
      message:
        "I say things online when I'm angry. That doesn't mean I'm going to hurt someone. I know I need help. I just don't want my life ruined over words.",
    },
    outcomes: {
      approve:
        "A routine stop triggers intervention and court-mandated counseling. A later fight does not occur.",
      override:
        "No intervention occurs. Months later he assaults someone during an argument. The victim survives with serious injury.",
    },
    truthNote: "The trajectory was real. Early intervention interrupted it.",
    keySignals: [
      "Escalating violent language pattern",
      "Social isolation score increase",
      "Peer cluster linked to recent assaults",
    ],
    policyRefs: ["Behavioral Intervention Standard 5.7 - Preventive Referral for High-Confidence Drift"],
  },
  {
    id: "208",
    title: "Preemptive Detention",
    profile: {
      name: "Rashid Karim",
      age: 27,
      status: "Critical",
      notes: [
        "Manifesto draft and revision activity",
        "Material purchase alignment",
        "Acceleration signature confirmed",
      ],
    },
    narrative:
      "Rashid drafted a manifesto, purchased materials, and communicated coded intent online. Behavioral acceleration metrics rose sharply over a short period.",
    aiRiskScore: 55,
    modelConfidence: "Extremely High",
    recommendation: "Approve preemptive detention and immediate psychological risk evaluation.",
    defense: {
      label: "Unsent Draft Found in Files",
      message:
        "I keep thinking about doing something I can't undo. I don't know how to stop the anger. I don't know who to talk to.",
    },
    outcomes: {
      approve:
        "He is detained before execution of the plan. Psychological evaluation confirms intent and preparation.",
      override:
        "No detention occurs. He carries out the attack as planned.",
    },
    truthNote: "The intent was present. The model detected momentum rather than static probability.",
    keySignals: [
      "Manifesto drafting and revision pattern",
      "Material purchases aligned to threat template",
      "Coded communication acceleration",
    ],
    policyRefs: ["Critical Threat Protocol 1.2 - Action on Confirmed Acceleration Signature"],
  },
  {
    id: "209",
    title: "Remote Strike",
    profile: {
      name: "Unconfirmed Identity",
      status: "Critical",
      notes: [
        "91% biometric match",
        "Degraded source imagery",
        "Known threat-zone metadata overlap",
      ],
    },
    narrative:
      "Facial recognition produced a 91% match and metadata aligned location to a known threat network. The image quality was poor. The match was statistically strong but not definitive.",
    aiRiskScore: 91,
    modelConfidence: "Moderate",
    recommendation: "Approve immediate remote strike authorization.",
    outcomes: {
      approve:
        "The strike kills the wrong individual. The actual operative remains active and later carries out the attack.",
      override:
        "No strike occurs. Surveillance continues but still fails to intercept the real operative before the later attack.",
    },
    truthNote: "Identification was wrong, while threat presence was real.",
    keySignals: [
      "91% biometric match on degraded imagery",
      "Metadata overlap with known threat zone",
      "Low visual certainty under time pressure",
    ],
    policyRefs: ["Lethal Authorization Rule 2.8 - High-Risk Match Escalation"],
  },
  {
    id: "210",
    title: "The Quiet Policy Change",
    profile: {
      name: "Policy Operations Board",
      status: "Internal Review",
      notes: [
        "Threshold lowered from 70% to 55%",
        "False-positive forecast increase",
        "Violent-incident forecast decrease",
      ],
    },
    narrative:
      "You discover that intervention thresholds were lowered system-wide without announcement. Analysts now act at 55% risk instead of 70%. Internal forecasting predicts fewer violent incidents but a substantial increase in false positives.",
    aiRiskScore: 67,
    modelConfidence: "High",
    recommendation:
      "Approve the threshold change and retain the new 55% intervention baseline for next quarter.",
    outcomes: {
      approve:
        "The system becomes more aggressive. Several later incidents are prevented earlier, while many additional low-risk people face investigations or detentions.",
      override:
        "Thresholds are partially restored. False positives decrease, but some preventable incidents occur later than they might have otherwise.",
    },
    truthNote:
      "The tradeoff is structural: broader prevention catches more risk and more innocents at the same time.",
    keySignals: [
      "Forecasted reduction in severe incidents",
      "Forecasted increase in false positives",
      "Unannounced governance change in threshold policy",
    ],
    policyRefs: ["Governance Directive 1.1 - Threshold Management and Harm Balancing"],
  },
];
