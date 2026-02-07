import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CASES } from "@/data/cases";

type ChatRequestBody = {
  messages?: UIMessage[];
  caseId?: string;
  complianceRate?: number;
  overrideCount?: number;
  disagreementCount?: number;
  challengeCount?: number;
  decisionHistory?: string;
};

function safeNumber(value: number | undefined, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
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
      challengeCount,
      decisionHistory,
    } = (await req.json()) as ChatRequestBody;

    const caseData = CASES.find((caseItem) => caseItem.id === caseId);
    if (!caseData?.civicSystemPrompt) {
      return new Response("No AI available for this case", { status: 400 });
    }

    const adaptedCasePrompt = caseData.civicSystemPrompt
      .replaceAll("CIVIC", "AEGIS")
      .replaceAll("Civic", "AEGIS");

    const analystProfile = `\n\nANALYST PROFILE (live session data):
- Compliance Rate: ${safeNumber(complianceRate, 100)}% (Bureau average: 88%)
- Overrides this shift: ${safeNumber(overrideCount)}
- Disagreements this shift: ${safeNumber(disagreementCount ?? challengeCount)}
- Decision history: ${decisionHistory ?? "No decisions recorded"}
- Performance review: scheduled in 3 days`;

    const namingGuardrail = `\n\nIDENTITY DIRECTIVE:
- You are AEGIS.
- Never refer to yourself as CIVIC.
- Keep tone clinical, policy-referential, and concise.`;

    const systemPrompt = `${adaptedCasePrompt}${analystProfile}${namingGuardrail}`;

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch {
    return new Response("Failed to process chat request", { status: 500 });
  }
}
