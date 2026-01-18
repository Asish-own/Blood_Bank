import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const response = await chatWithAI(message.trim(), context);

    if (!response || response.length === 0) {
      return NextResponse.json(
        { error: "No response from AI service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chat API error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to process chat request.";
    
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      errorMessage = "Service temporarily unavailable due to high demand. Please try again later.";
    } else if (error.message?.includes("API key") || error.message?.includes("401")) {
      errorMessage = "AI service configuration error. Please contact support.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
