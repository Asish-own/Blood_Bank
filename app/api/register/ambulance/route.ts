import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { driverName, ambulanceNumber, serviceArea, phone, availability } = await request.json();

    // Validation
    if (!driverName || !ambulanceNumber || !serviceArea || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Save to Firestore
    const ambulanceData = {
      driverName,
      ambulanceNumber,
      serviceArea,
      phone,
      availability: availability !== undefined ? availability : true,
      createdAt: serverTimestamp(),
      status: 'active',
      location: null, // Will be updated via GPS
    };

    const docRef = await addDoc(collection(db, 'ambulances'), ambulanceData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Ambulance driver registered successfully',
    });
  } catch (error: any) {
    console.error('Ambulance registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register ambulance' },
      { status: 500 }
    );
  }
}
