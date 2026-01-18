import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';

import { auth } from './config';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'donor' | 'patient' | 'ambulance' | 'hospital' | 'doctor';
  blood?: string | null;        // ✅ Type fixed
  phone?: string | null;        // ✅ Type fixed
  location?: {
    lat: number;
    lng: number;
  };
  rewardPoints?: number;
  createdAt: Date;
}

/* -------------------------------------------------------
   🔥 LOGIN WITH EMAIL
------------------------------------------------------- */
export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/* -------------------------------------------------------
   🔥 SIGNUP WITH EMAIL
------------------------------------------------------- */
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: UserProfile['role'],
  bloodGroup?: string | null,
  phone?: string | null
) => {
  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update display name
  await updateProfile(userCredential.user, { displayName: name });

  // Build user profile object for Firestore
  const userProfile: UserProfile = {
    uid: userCredential.user.uid,
    email: userCredential.user.email || email,
    name,
    role,
    blood: bloodGroup || null,    // ✅ Firestore-friendly
    phone: phone || null,         // ✅ Firestore-friendly
    rewardPoints: 0,
    createdAt: new Date(),
  };

  // Save user in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

  /* -------------------------------------------------------
     🔥 ROLE-SPECIFIC DOCUMENT CREATION
  ------------------------------------------------------- */

  // 1️⃣ Ambulance Driver
  if (role === 'ambulance') {
    await addDoc(collection(db, 'ambulances'), {
      driverId: userCredential.user.uid,
      driverName: name,
      status: 'available',
      coords: { lat: 0, lng: 0 },
      vehicleNumber: `AMB-${userCredential.user.uid.substring(0, 6).toUpperCase()}`,
      createdAt: new Date(),
    });
  }

  // 2️⃣ Hospital / Blood Bank
  if (role === 'hospital') {
    await addDoc(collection(db, 'hospitals'), {
      adminId: userCredential.user.uid,
      name,
      coords: { lat: 0, lng: 0 },
      address: '',
      bloodStock: {
        'A+': 0, 'A-': 0,
        'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0,
        'O+': 0, 'O-': 0,
      },
      icuBeds: 0,
      otAvailability: true,
      specialization: [],
      createdAt: new Date(),
    });
  }

  return userCredential.user;
};

/* -------------------------------------------------------
   🔥 GOOGLE SIGN-IN
------------------------------------------------------- */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);

  // Check if profile already exists
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

  if (!userDoc.exists()) {
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      name: userCredential.user.displayName || 'User',
      role: 'patient',         // Default role
      blood: null,             // Default for new Google user
      rewardPoints: 0,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
  }

  return userCredential.user;
};

/* -------------------------------------------------------
   🔥 LOGOUT
------------------------------------------------------- */
export const logout = async () => {
  await signOut(auth);
};

/* -------------------------------------------------------
   🔥 GET USER PROFILE
------------------------------------------------------- */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

/* -------------------------------------------------------
   🔥 UPDATE USER PROFILE
------------------------------------------------------- */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  await setDoc(doc(db, 'users', uid), updates, { merge: true });
};
