import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { patientName, hospitalName, requiredBloodGroup, urgencyLevel, phoneNumber } = await request.json();

    // Validation
    if (!patientName || !hospitalName || !requiredBloodGroup || !urgencyLevel || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(requiredBloodGroup)) {
      return NextResponse.json(
        { error: 'Invalid blood group' },
        { status: 400 }
      );
    }

    const validUrgencyLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validUrgencyLevels.includes(urgencyLevel)) {
      return NextResponse.json(
        { error: 'Invalid urgency level' },
        { status: 400 }
      );
    }

    // Save to Firestore
    const receiverData = {
      patientName,
      hospitalName,
      requiredBloodGroup,
      urgencyLevel,
      phoneNumber,
      createdAt: serverTimestamp(),
      status: 'pending',
    };

    const docRef = await addDoc(collection(db, 'blood_requests'), receiverData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Blood receiver registered successfully',
    });
  } catch (error: any) {
    console.error('Receiver registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register receiver' },
      { status: 500 }
    );
  }
}
