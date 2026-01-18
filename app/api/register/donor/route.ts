import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { name, age, bloodGroup, phone, address, donationHistory } = await request.json();

    // Validation
    if (!name || !age || !bloodGroup || !phone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (age < 18 || age > 65) {
      return NextResponse.json(
        { error: 'Age must be between 18 and 65' },
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

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return NextResponse.json(
        { error: 'Invalid blood group' },
        { status: 400 }
      );
    }

    // Save to Firestore
    const donorData = {
      name,
      age,
      bloodGroup,
      phone,
      address,
      donationHistory: donationHistory || '',
      createdAt: serverTimestamp(),
      status: 'active',
    };

    const docRef = await addDoc(collection(db, 'donors'), donorData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Blood donor registered successfully',
    });
  } catch (error: any) {
    console.error('Donor registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register donor' },
      { status: 500 }
    );
  }
}
