import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

const extractionSchema = {
  type: Type.OBJECT,
  properties: {
    income: { type: Type.NUMBER },
    rent: { type: Type.NUMBER },
    transport: { type: Type.NUMBER },
    debt: { type: Type.NUMBER },
    subscriptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          cost: { type: Type.NUMBER }
        }
      }
    }
  }
};

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
    const { fileData } = req.body as { fileData: { base64: string; mimeType: string } };
    if (!fileData?.base64 || !fileData?.mimeType) {
      return res.status(400).json({ error: "Missing fileData.base64 or fileData.mimeType" });
    }

    const response = await getGenAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract financial data from this document. Convert values to MYR monthly equivalents." },
            { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
        temperature: 0.1
      }
    });

    if (!response.text) return res.status(500).json({ error: "No response from AI" });
    return res.status(200).json(JSON.parse(response.text));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}