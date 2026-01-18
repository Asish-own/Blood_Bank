import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    console.log("📩 Incoming Chat Request...");

    const body = await req.json();
    console.log("🔍 Request Body:", body);

    if (!body?.message) {
      console.error("❌ Missing 'message' in body");
      return new Response(JSON.stringify({ error: "No message provided" }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing");
      return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
    }

    console.log("🔑 GEMINI_API_KEY Loaded:", !!process.env.GEMINI_API_KEY);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    console.log("🤖 Model Loaded Successfully");

    const result = await model.generateContent(body.message);
    console.log("📨 Raw Gemini Response:", result);

    const text = result.response.text();
    console.log("💬 Gemini Reply:", text);

    return new Response(JSON.stringify({ reply: text }), { status: 200 });

  } catch (err: any) {
    console.error("❌ AI Chatbot Error:", err);

    return new Response(JSON.stringify({
      error: err.message || "Unknown error",
      stack: err.stack || "",
      details: err.toString(),
    }), { status: 500 });
  }
}
