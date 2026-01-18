import { NextRequest, NextResponse } from 'next/server';
import { estimateAccidentSeverity } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const severity = await estimateAccidentSeverity(imageBase64);

    return NextResponse.json({ severity });
  } catch (error: any) {
    console.error('Severity estimation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to estimate severity' },
      { status: 500 }
    );
  }
}
