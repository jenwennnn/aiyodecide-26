import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// --- reuse your schema and systemInstruction here (copy from your current ai.ts) ---
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    version: { type: Type.STRING },
    decision_type: { type: Type.STRING },
    user_goal: { type: Type.STRING },
    summary_of_input: { type: Type.STRING },
    options_compared: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    key_numbers_extracted: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    recommendation: { type: Type.OBJECT },
    tradeoff_analysis: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    missing_info: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    copy_paste_scripts: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    explanations: { type: Type.OBJECT },
    localized_resources: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    score: { type: Type.OBJECT },
    override_mode: { type: Type.STRING, enum: ["NORMAL", "EMERGENCY"] }
  },
  required: [
    "version","decision_type","user_goal","summary_of_input",
    "options_compared","key_numbers_extracted","recommendation",
    "tradeoff_analysis","missing_info","copy_paste_scripts",
    "explanations","localized_resources","score","override_mode"
  ]
};

const systemInstruction = `PASTE YOUR FULL systemInstruction STRING HERE`;

let ai: GoogleGenAI | null = null;
function getGenAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing on server.");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, image } = req.body as {
      text: string;
      image?: { base64: string; mimeType: string };
    };

    const parts: any[] = [];
    if (text) parts.push({ text });
    if (image?.base64 && image?.mimeType) {
      parts.push({ inlineData: { data: image.base64, mimeType: image.mimeType } });
    }

    if (parts.length === 0) return res.status(400).json({ error: "Missing text or image" });

    const response = await getGenAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2
      }
    });

    if (!response.text) return res.status(500).json({ error: "No response from AI" });
    return res.status(200).json(JSON.parse(response.text));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}