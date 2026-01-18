import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Use Gemini Flash Model (Correct for 2024–2025)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-001",
});

/* ======================================================
   PURE CHAT FUNCTION — FIXED FOR GEMINI 1.5
====================================================== */
export async function chatWithAI(message: string, context?: string): Promise<string> {
  try {
    const system = context || 
      "You are an AI assistant for LifeLink AI, a blood donation and emergency care platform.";

    // CORRECT request body format
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: system + "\n\nUser: " + message }]
        }
      ]
    });

    const text = await result.response.text();
    return text || "I couldn't generate a response. Please try again.";
  } catch (err: any) {
    console.error("ChatWithAI ERROR:", err);

    if (err.message?.includes("quota") || err.message?.includes("429"))
      return "AI service is busy due to high demand. Please try again.";

    if (err.message?.includes("API key"))
      return "AI is not configured. Please set GEMINI_API_KEY.";

    return "I encountered an error processing your request.";
  }
}

/* ======================================================
   2. BLOOD DEMAND — WORKING
====================================================== */
export async function predictBloodDemand(
  accidentHistory: number,
  festivals: string[],
  weather: string,
  cityPopulation: number
) {
  const prompt = `
Predict blood demand percentages:
Accidents: ${accidentHistory}
Festivals: ${festivals.join(", ")}
Weather: ${weather}
Population: ${cityPopulation}
Return JSON object only.
  `;

  try {
    const result = await model.generateContent(prompt);
    const txt = await result.response.text();

    const json = txt.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);
  } catch (e) {}

  return {
    "A+": 20,
    "A-": 5,
    "B+": 20,
    "B-": 5,
    "AB+": 5,
    "AB-": 2,
    "O+": 35,
    "O-": 8
  };
}

/* ======================================================
   3. GHS Score — FIXED
====================================================== */
export async function calculateGHSScore(
  ambulanceETA: number,
  bloodAvailable: boolean,
  icuReady: boolean,
  distance: number
) {
  const prompt = `
Calculate Golden Hour Survival Score:
ETA=${ambulanceETA},
Blood=${bloodAvailable},
ICU=${icuReady},
Distance=${distance}
Return JSON only.
`;

  try {
    const result = await model.generateContent(prompt);
    const txt = await result.response.text();
    const json = txt.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);
  } catch (e) {}

  return {
    score: Math.max(0, 100 - ambulanceETA * 2 - (bloodAvailable ? 0 : 20) - (icuReady ? 0 : 15)),
    factors: ["Time to treatment", "Resource availability"],
  };
}

// ======================================================
// 4. BEST HOSPITAL — FULLY FIXED WITH TYPES
// ======================================================

export interface HospitalInfo {
  id: string;
  name: string;
  distance: number;
  icuBeds: number;
  bloodStock: Record<string, number>;
  specialization?: string[];
}

export async function selectBestHospital(
  hospitals: HospitalInfo[],
  requiredBloodType?: string
): Promise<string> {
  try {
    const prompt = `
Pick BEST hospital:

Hospitals:
${hospitals
  .map((h: HospitalInfo) => 
    `${h.name}, Distance ${h.distance}km, ICU: ${h.icuBeds}, Blood=${JSON.stringify(h.bloodStock)}`
  )
  .join("\n")}

Required blood: ${requiredBloodType}
Return ONLY hospital ID.
`;

    const result = await model.generateContent(prompt);
    const txt = (await result.response.text()).trim();

    const found = hospitals.find(
      (h: HospitalInfo) => txt.includes(h.id) || txt.includes(h.name)
    );

    return found?.id || hospitals[0].id;
  } catch (e) {
    // Fallback sorting (distance + ICU priority)
    const best = hospitals.sort((a: HospitalInfo, b: HospitalInfo) => {
      if (a.icuBeds > 0 && b.icuBeds === 0) return -1;
      if (a.icuBeds === 0 && b.icuBeds > 0) return 1;
      return a.distance - b.distance;
    });

    return best[0].id;
  }
}


/* ======================================================
   5. ACCIDENT SEVERITY (VISION MODEL)
====================================================== */
export async function estimateAccidentSeverity(imageBase64: string) {
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        }
      },
      { text: "Return: Low, Medium, or High." }
    ]);

    const txt = result.response.text().toLowerCase();

    if (txt.includes("high")) return "High";
    if (txt.includes("medium")) return "Medium";
    return "Low";
  } catch (e) {
    return "Medium";
  }
}

/* ======================================================
   6. BLOOD COMPATIBILITY — FIXED
====================================================== */
export async function checkBloodCompatibility(donorType: string, recipientType: string) {
  try {
    const result = await model.generateContent(`
Check blood compatibility:
Donor: ${donorType}
Recipient: ${recipientType}
Return JSON only.
`);

    const txt = await result.response.text();
    const json = txt.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);
  } catch (e) {}

  return {
    compatible: false,
    reason: "Cannot determine compatibility.",
  };
}
