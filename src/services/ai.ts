import { AiyoResponse, ExtractedSnapshot } from "../types.js";

export async function analyzeTradeOff(
  text: string,
  image?: { base64: string; mimeType: string }
): Promise<AiyoResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, image }),
  });

  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as AiyoResponse;
}

export async function extractFinancialDocument(
  fileData: { base64: string; mimeType: string }
): Promise<ExtractedSnapshot> {
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileData }),
  });

  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as ExtractedSnapshot;
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const [meta, data] = reader.result.split(",");
        const mimeType = meta.split(":")[1].split(";")[0];
        resolve({ base64: data, mimeType });
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
}