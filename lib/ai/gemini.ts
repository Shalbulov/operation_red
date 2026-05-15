import { GoogleGenAI, Type } from "@google/genai";
import { COACH_SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

export interface CoachResponse {
  x: number;
  y: number;
  action: "reveal" | "flag";
  confidence: number;
  reasoning: string;
}

export async function getCoachHint(opts: {
  boardText: string;
  width: number;
  height: number;
  mines: number;
  flagsPlaced: number;
}): Promise<CoachResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = buildUserPrompt(
    opts.boardText,
    opts.width,
    opts.height,
    opts.mines,
    opts.flagsPlaced,
  );

  const result = await ai.models.generateContent({
    model,
    contents: [
      { role: "user", parts: [{ text: userPrompt }] },
    ],
    config: {
      systemInstruction: COACH_SYSTEM_PROMPT,
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.INTEGER, minimum: 0, maximum: opts.width - 1 },
          y: { type: Type.INTEGER, minimum: 0, maximum: opts.height - 1 },
          action: { type: Type.STRING, enum: ["reveal", "flag"] },
          confidence: { type: Type.NUMBER, minimum: 0, maximum: 1 },
          reasoning: { type: Type.STRING },
        },
        required: ["x", "y", "action", "confidence", "reasoning"],
      },
    },
  });

  const text = result.text;
  if (!text) throw new Error("empty response from gemini");

  let parsed: CoachResponse;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("failed to parse gemini json");
  }

  // Validate coordinates
  if (
    !Number.isInteger(parsed.x) ||
    !Number.isInteger(parsed.y) ||
    parsed.x < 0 ||
    parsed.x >= opts.width ||
    parsed.y < 0 ||
    parsed.y >= opts.height
  ) {
    throw new Error("invalid coordinates from gemini");
  }

  return parsed;
}
