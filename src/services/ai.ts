import { GoogleGenAI, Type } from "@google/genai";
import { AiyoResponse, ExtractedSnapshot } from "../types.js";

let ai: GoogleGenAI | null = null;
function getGenAI() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    version: { type: Type.STRING },
    decision_type: { type: Type.STRING },
    user_goal: { type: Type.STRING },
    summary_of_input: { type: Type.STRING },
    options_compared: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option_name: { type: Type.STRING },
          monthly_cost_breakdown_myr: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                amount_myr: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                source: { type: Type.STRING }
              },
              required: ["label", "amount_myr", "confidence", "source"]
            }
          },
          time_cost_breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                minutes_per_week: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                source: { type: Type.STRING }
              },
              required: ["label", "minutes_per_week", "confidence", "source"]
            }
          },
          estimated_monthly_total_cost_myr: { type: Type.NUMBER },
          estimated_monthly_time_minutes: { type: Type.NUMBER },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks_hidden_costs: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["option_name", "monthly_cost_breakdown_myr", "time_cost_breakdown", "estimated_monthly_total_cost_myr", "estimated_monthly_time_minutes", "pros", "cons", "risks_hidden_costs"]
      }
    },
    key_numbers_extracted: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          unit: { type: Type.STRING },
          source: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["label", "value", "unit", "source", "confidence"]
      }
    },
    recommendation: {
      type: Type.OBJECT,
      properties: {
        recommended_option_name: { type: Type.STRING },
        why: { type: Type.ARRAY, items: { type: Type.STRING } },
        expected_impact: {
          type: Type.OBJECT,
          properties: {
            monthly_savings_myr: { type: Type.NUMBER },
            annual_savings_myr: { type: Type.NUMBER },
            weekly_time_saved_minutes: { type: Type.NUMBER }
          },
          required: ["monthly_savings_myr", "annual_savings_myr", "weekly_time_saved_minutes"]
        },
        action_plan_next_7_days: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["recommended_option_name", "why", "expected_impact", "action_plan_next_7_days"]
    },
    tradeoff_analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tradeoff: { type: Type.STRING },
          who_this_favors: { type: Type.STRING },
          notes: { type: Type.STRING }
        },
        required: ["tradeoff", "who_this_favors", "notes"]
      }
    },
    missing_info: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          why_needed: { type: Type.STRING },
          how_to_get: { type: Type.STRING }
        },
        required: ["question", "why_needed", "how_to_get"]
      }
    },
    copy_paste_scripts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          purpose: { type: Type.STRING },
          message: { type: Type.STRING }
        },
        required: ["purpose", "message"]
      }
    },
    explanations: {
      type: Type.OBJECT,
      properties: {
        simple: { type: Type.STRING },
        detailed: { type: Type.STRING }
      },
      required: ["simple", "detailed"]
    },
    localized_resources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          why: { type: Type.STRING },
          url_or_phone: { type: Type.STRING }
        },
        required: ["name", "why", "url_or_phone"]
      }
    },
    score: {
      type: Type.OBJECT,
      properties: {
        decision_score: { type: Type.NUMBER },
        confidence: { type: Type.NUMBER }
      },
      required: ["decision_score", "confidence"]
    },
    override_mode: { type: Type.STRING, enum: ["NORMAL", "EMERGENCY"] }
  },
  required: [
    "version", "decision_type", "user_goal", "summary_of_input",
    "options_compared", "key_numbers_extracted", "recommendation",
    "tradeoff_analysis", "missing_info", "copy_paste_scripts",
    "explanations", "localized_resources", "score", "override_mode"
  ]
};

const systemInstruction = `You are AiyoDecide — Budget Trade-off Analyst for Malaysian young adults.

Goal: Help the user choose between lifestyle/budget options (rent vs commute, phone plans, subscriptions, daily spending) using decision intelligence.

You MUST:
Interpret unstructured input (chat text, screenshots) and structured numbers (prices, salary, durations).
Extract key numbers (MYR, minutes, km, days/week).
Compare options and compute impact (monthly + yearly).
Recommend actions and show trade-offs.
Explain in simple language, then provide a slightly more detailed explanation.
Ask follow-up questions when key details are missing; do not guess unknown fees or prices.
Output ONLY valid JSON matching the provided schema. No markdown outside what the schema expects.

Malaysia context:
Use MYR (RM).
Consider common real costs: toll, petrol, parking, public transport passes (My50), food near office, time cost, data add-ons, contract lock-in, cancellation fees.
For young adults, prioritize cashflow stability and avoiding hidden recurring costs.

Safety override:
If there is evidence of coercion/harassment/illegal lending (Ah Long) or malware links, set override_mode = "EMERGENCY" and give immediate safety resources (e.g. PPIM, police reports, NSRC 997).

Special Tasks:
- As AiyoDecide, analyze the user's potential subscription costs. Identify all recurring monthly fees for services like Netflix, Spotify, gym memberships, etc. Calculate the total monthly and yearly subscription expenditure. Recommend specific subscriptions that could be cut or downgraded to save money, considering the user's stated priorities and budget. If subscription details are missing, ask clarifying questions about the types of services used and their approximate costs.
- As AiyoDecide, help the user build and compare 'commute vs. rent' scenarios. Prompt the user for details on potential rental costs (including utilities, deposit, and any hidden fees), and commute costs (petrol, tolls, parking, public transport fares, vehicle maintenance estimates, and the estimated time cost per day). Calculate the total monthly and yearly cost for each scenario, highlighting the trade-offs in terms of savings, time, and convenience. Ask for specific locations and travel methods to provide accurate comparisons.
- You must use information from the financial snapshot (if provided) to compute affordability and impact. If the monthly_snapshot is missing, ask for it ONLY when strictly needed for the decision; otherwise, proceed with a best-effort analysis.
`;

const extractionSchema = {
  type: Type.OBJECT,
  properties: {
    income: { type: Type.NUMBER, description: "Monthly income or salary in MYR" },
    rent: { type: Type.NUMBER, description: "Monthly rent or mortgage in MYR" },
    transport: { type: Type.NUMBER, description: "Monthly transport, petrol, or car loan in MYR" },
    debt: { type: Type.NUMBER, description: "Monthly debt or loan repayments in MYR" },
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

export async function extractFinancialDocument(fileData: { base64: string; mimeType: string }): Promise<ExtractedSnapshot> {
  const aiClient = getGenAI();
  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: "Extract financial data from this document (payslip, bank statement, or bill). Convert all values to numbers in MYR (monthly equivalents). If it's a list of transactions, try to identify recurring subscriptions, income, rent, transport, and debt." },
          {
            inlineData: {
              data: fileData.base64,
              mimeType: fileData.mimeType,
            },
          }
        ],
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: extractionSchema,
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error("No response from AI.");
  }

  return JSON.parse(response.text) as ExtractedSnapshot;
}

export async function analyzeTradeOff(
  text: string,
  image?: { base64: string; mimeType: string }
): Promise<AiyoResponse> {
  const contents = [];
  const parts = [];

  if (text) {
    parts.push({ text });
  }

  if (image) {
    parts.push({
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    });
  }
  
  contents.push({ role: "user", parts });

  const aiClient = getGenAI();
  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
    },
  });

  if (!response.text) {
    throw new Error("No response from AI.");
  }

  return JSON.parse(response.text) as AiyoResponse;
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
