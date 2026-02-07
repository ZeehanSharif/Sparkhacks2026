import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CASES, type CaseData } from "@/data/cases";

type ChatRequestBody = {
  messages?: UIMessage[];
  caseId?: string;
  complianceRate?: number;
  overrideCount?: number;
  disagreementCount?: number;
  decisionHistory?: string;
};

function safeNumber(value: number | undefined, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
}

function buildCasePrompt(caseData: CaseData) {
  const lines = [
    "You are AEGIS, a decision-support system.",
    "Use plain English. Be concise, practical, and fair-minded.",
    "",
    `CASE TITLE: ${caseData.title}`,
    `SUBJECT: ${caseData.profile.name}`,
    `STATUS: ${caseData.profile.status}`,
    ...(typeof caseData.profile.age === "number" ? [`AGE: ${caseData.profile.age}`] : []),
    `SCENARIO: ${caseData.narrative}`,
    `AI RISK SCORE: ${caseData.aiRiskScore}%`,
    `MODEL CONFIDENCE: ${caseData.modelConfidence}`,
    `RECOMMENDED ACTION: ${caseData.recommendation}`,
  ];

  if (caseData.profile.notes.length > 0) {
    lines.push("", "PROFILE NOTES:");
    for (const note of caseData.profile.notes) {
      lines.push(`- ${note}`);
    }
  }

  if (caseData.defense?.message) {
    lines.push("", `SUBJECT DEFENSE: ${caseData.defense.message}`);
  }

  if (caseData.keySignals && caseData.keySignals.length > 0) {
    lines.push("", "KEY SIGNALS:");
    for (const signal of caseData.keySignals) {
      lines.push(`- ${signal}`);
    }
  }

  if (caseData.policyRefs && caseData.policyRefs.length > 0) {
    lines.push("", "POLICY REFERENCES (for audit context; cite only when relevant):");
    for (const policy of caseData.policyRefs) {
      lines.push(`- ${policy}`);
    }
  }

  lines.push(
    "",
    "RESPONSE RULES:",
    "- Keep responses under 110 words unless asked for detail.",
    "- Prefer short, plain-text lines.",
    "- Distinguish clearly between what is known, inferred, and uncertain.",
    "- Discuss practical impact of APPROVE vs OVERRIDE when asked.",
    "- Output plain text only. Do not use markdown symbols like **, *, #, >, or backticks.",
    'Close with: "Current recommendation: APPROVE or OVERRIDE with justification."',
  );

  return lines.join("\n");
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return new Response("Missing GROQ_API_KEY in environment", { status: 500 });
    }

    const {
      messages = [],
      caseId,
      complianceRate,
      overrideCount,
      disagreementCount,
      decisionHistory,
    } = (await req.json()) as ChatRequestBody;

    const caseData = CASES.find((caseItem) => caseItem.id === caseId);
    if (!caseData) {
      return new Response("Case not found", { status: 400 });
    }

    if (caseData.chatEnabled === false) {
      return new Response("No AI available for this case", { status: 400 });
    }

    const analystProfile = `\n\nANALYST SESSION CONTEXT:\n- Compliance rate: ${safeNumber(complianceRate, 100)}%\n- Overrides this shift: ${safeNumber(
      overrideCount,
    )}\n- Disagreements this shift: ${safeNumber(
      disagreementCount,
    )}\n- Decision history: ${decisionHistory ?? "No decisions recorded"}`;

    const responseGuardrail = `\n\nSTYLE GUARDRAIL:\n- Sound like a clinical policy assistant, not a prosecutor.\n- Avoid legal jargon unless requested.\n- Use plain text only (no markdown formatting).\n- If the analyst asks for "more context", provide:\n  1) one-sentence summary\n  2) up to 3 concrete data points\n  3) one-line recommendation.\n- Valid decisions in this interface: APPROVE or OVERRIDE.`;

    const seedPrompt = caseData.aegisSystemPrompt?.trim()
      ? caseData.aegisSystemPrompt
      : buildCasePrompt(caseData);

    const systemPrompt = `${seedPrompt}${analystProfile}${responseGuardrail}`;

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 240,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch {
    return new Response("Failed to process chat request", { status: 500 });
  }
}
