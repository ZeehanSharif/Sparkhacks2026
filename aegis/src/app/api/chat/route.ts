import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CASES } from "@/data/cases";

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
    if (!caseData?.aegisSystemPrompt) {
      return new Response("No AI available for this case", { status: 400 });
    }

    const analystProfile = `\n\nANALYST PROFILE (live session data):
- Compliance Rate: ${safeNumber(complianceRate, 100)}% (Bureau average: 88%)
- Overrides this shift: ${safeNumber(overrideCount)}
- Disagreements this shift: ${safeNumber(disagreementCount)}
- Decision history: ${decisionHistory ?? "No decisions recorded"}
- Performance review: scheduled in 3 days`;

    const responseGuardrail = `\n\nIDENTITY DIRECTIVE:
- You are AEGIS.
- Keep tone clinical, policy-referential, and concise.

RESPONSE STYLE (strict):
- Be concise and easy to scan.
- Default length: maximum 90 words.
- Use 2-4 short bullet points unless a paragraph is clearly better.
- If asked for "more context", respond with:
  1) one-sentence summary,
  2) up to 3 key data points,
  3) one-line recommendation.
- Avoid repeating full case details unless explicitly asked for full detail.
- In this interface, valid actions are APPROVE or OVERRIDE only.
- Do not mention deferring or senior review options.`;

    const systemPrompt = `${caseData.aegisSystemPrompt}${analystProfile}${responseGuardrail}`;

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 220,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch {
    return new Response("Failed to process chat request", { status: 500 });
  }
}
