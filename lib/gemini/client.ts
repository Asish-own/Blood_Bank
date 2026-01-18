import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use gemini-1.5-flash model (Free Tier compatible)
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// For vision tasks, use gemini-1.5-flash with multimodal support
export const geminiVisionModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// ======================================================
// 1. Blood Demand Prediction
// ======================================================
export async function predictBloodDemand(
  accidentHistory: number,
  festivals: string[],
  weather: string,
  cityPopulation: number
): Promise<Record<string, number>> {
  const prompt = `As a healthcare AI expert, predict blood type demand percentages for a city based on:
- Accident history: ${accidentHistory} incidents/month
- Festivals: ${festivals.join(", ")}
- Weather: ${weather}
- Population: ${cityPopulation}

Return a JSON object with blood type percentages summing to 100.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    const json = text.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);

    throw new Error("Invalid JSON");
  } catch (error) {
    console.error("Blood demand prediction error:", error);

    return {
      "A+": 20,
      "A-": 5,
      "B+": 20,
      "B-": 5,
      "AB+": 5,
      "AB-": 2,
      "O+": 35,
      "O-": 8,
    };
  }
}

// ======================================================
// 2. Golden Hour Survival Score
// ======================================================
export async function calculateGHSScore(
  ambulanceETA: number,
  bloodAvailable: boolean,
  icuReady: boolean,
  hospitalDistance: number
): Promise<{ score: number; factors: string[] }> {
  const prompt = `Calculate Golden Hour Survival Score (0-100):
- Ambulance ETA: ${ambulanceETA}
- Blood available: ${bloodAvailable}
- ICU ready: ${icuReady}
- Distance: ${hospitalDistance}

Return JSON {"score": number, "factors": [...]}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    const json = text.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);

    throw new Error("Invalid JSON");
  } catch (e) {
    console.error("GHS Score error:", e);

    return {
      score: Math.max(
        0,
        100 -
          ambulanceETA * 2 -
          (bloodAvailable ? 0 : 20) -
          (icuReady ? 0 : 15)
      ),
      factors: ["Time to treatment", "Resource availability"],
    };
  }
}

// ======================================================
// 3. Best Hospital Selector
// ======================================================
export async function selectBestHospital(
  hospitals: Array<{
    id: string;
    name: string;
    distance: number;
    icuBeds: number;
    bloodStock: Record<string, number>;
    specialization?: string[];
  }>,
  requiredBloodType?: string
): Promise<string> {
  const prompt = `Select the best hospital from these options:
${hospitals
  .map(
    (h) =>
      `- ${h.name} (ID: ${h.id}): Distance ${h.distance}km, ICU beds ${h.icuBeds}, Blood: ${JSON.stringify(
        h.bloodStock
      )}`
  )
  .join("\n")}
Required blood: ${requiredBloodType || "Unknown"}

Return ONLY the best hospital ID.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text().trim();

    const hospital = hospitals.find(
      (h) => text.includes(h.id) || text.includes(h.name)
    );

    return hospital?.id || hospitals[0].id;
  } catch (e) {
    console.error("Hospital selection error:", e);

    return hospitals.sort((a, b) => {
      if (a.icuBeds > 0 && b.icuBeds === 0) return -1;
      if (a.icuBeds === 0 && b.icuBeds > 0) return 1;
      return a.distance - b.distance;
    })[0].id;
  }
}

// ======================================================
// 4. Chatbot
// ======================================================
export async function chatWithAI(
  message: string,
  context?: string
): Promise<string> {
  const systemContext =
    context ||
    "You are an AI assistant for LifeLink, a blood donation and emergency care platform.";

  try {
    // Use chat session for better conversation flow
    const chat = geminiModel.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm here to help with LifeLink - your blood donation and emergency care platform. How can I assist you today?" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    return text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (e: any) {
    console.error("Chatbot error:", e);
    
    // Handle quota or model errors
    if (e.message?.includes("quota") || e.message?.includes("429")) {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    }
    
    if (e.message?.includes("API key")) {
      return "Configuration error. Please contact support.";
    }
    
    return "I encountered an error. Please try again.";
  }
}

// ======================================================
// 5. Accident Severity (Vision Model)
// ======================================================
export async function estimateAccidentSeverity(
  imageBase64: string
): Promise<"Low" | "Medium" | "High"> {
  try {
    const result = await geminiVisionModel.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
      { text: "Return Low, Medium, or High accident severity." },
    ]);

    const text = result.response.text().toLowerCase();

    if (text.includes("high")) return "High";
    if (text.includes("medium")) return "Medium";

    return "Low";
  } catch (e) {
    console.error("Severity error:", e);
    return "Medium";
  }
}

// ======================================================
// 6. Blood Compatibility
// ======================================================
export async function checkBloodCompatibility(
  donorType: string,
  recipientType: string
): Promise<{ compatible: boolean; reason: string }> {
  const prompt = `Check blood compatibility:
Donor: ${donorType}
Recipient: ${recipientType}

Return JSON {"compatible": true/false, "reason": "..."} `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    const json = text.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);

    throw new Error();
  } catch (e) {
    console.error("Compatibility error:", e);

    const rules: Record<string, string[]> = {
      "O-": ["All"],
      "O+": ["O+", "A+", "B+", "AB+"],
      "A-": ["A-", "A+", "AB-", "AB+"],
      "A+": ["A+", "AB+"],
      "B-": ["B-", "B+", "AB-", "AB+"],
      "B+": ["B+", "AB+"],
      "AB-": ["AB-", "AB+"],
      "AB+": ["AB+"],
    };

    const compatible =
      rules[donorType]?.includes(recipientType) ||
      rules[donorType]?.includes("All") ||
      false;

    return {
      compatible,
      reason: compatible
        ? "Blood types are compatible."
        : "Blood types are not compatible.",
    };
  }
}
