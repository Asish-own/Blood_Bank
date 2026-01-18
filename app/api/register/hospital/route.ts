import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { hospitalName, address, emergencyContact, bloodStock } = await request.json();

    // Validation
    if (!hospitalName || !address || !emergencyContact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(emergencyContact)) {
      return NextResponse.json(
        { error: 'Invalid emergency contact number' },
        { status: 400 }
      );
    }

    // Validate blood stock
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (bloodStock) {
      for (const group of Object.keys(bloodStock)) {
        if (!validBloodGroups.includes(group)) {
          return NextResponse.json(
            { error: `Invalid blood group: ${group}` },
            { status: 400 }
          );
        }
        if (typeof bloodStock[group] !== 'number' || bloodStock[group] < 0) {
          return NextResponse.json(
            { error: `Invalid stock value for ${group}` },
            { status: 400 }
          );
        }
      }
    }

    // Initialize blood stock if not provided
    const defaultBloodStock: Record<string, number> = {};
    validBloodGroups.forEach((group) => {
      defaultBloodStock[group] = bloodStock?.[group] || 0;
    });

    // Save to Firestore
    const hospitalData = {
      name: hospitalName,
      address,
      emergencyContact,
      bloodStock: defaultBloodStock,
      createdAt: serverTimestamp(),
      status: 'active',
    };

    const docRef = await addDoc(collection(db, 'hospitals'), hospitalData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Hospital registered successfully',
    });
  } catch (error: any) {
    console.error('Hospital registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register hospital' },
      { status: 500 }
    );
  }
}
