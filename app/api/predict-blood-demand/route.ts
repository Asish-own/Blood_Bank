import { NextRequest, NextResponse } from 'next/server';
import { predictBloodDemand } from '@/lib/gemini/client_gemini_backup';

export async function POST(request: NextRequest) {
  try {
    const { accidentHistory, festivals, weather, cityPopulation } = await request.json();

    const prediction = await predictBloodDemand(
      accidentHistory || 0,
      festivals || [],
      weather || 'normal',
      cityPopulation || 1000000
    );

    return NextResponse.json({ prediction });
  } catch (error: any) {
    console.error('Blood demand prediction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to predict blood demand' },
      { status: 500 }
    );
  }
}
