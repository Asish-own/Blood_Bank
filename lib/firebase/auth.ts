import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'donor' | 'patient' | 'ambulance' | 'hospital' | 'doctor';
  bloodGroup?: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  };
  rewardPoints?: number;
  createdAt: Date;
}

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  role: UserProfile['role'],
  bloodGroup?: string,
  phone?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });

  const userProfile: UserProfile = {
    uid: userCredential.user.uid,
    email: userCredential.user.email || email,
    name,
    role,
    bloodGroup,
    phone,
    rewardPoints: 0,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

  // Create role-specific documents
  if (role === 'ambulance') {
    await addDoc(collection(db, 'ambulances'), {
      driverId: userCredential.user.uid,
      driverName: name,
      status: 'available',
      coords: { lat: 0, lng: 0 }, // Will be updated when location is available
      vehicleNumber: `AMB-${userCredential.user.uid.substring(0, 6).toUpperCase()}`,
      createdAt: new Date(),
    });
  } else if (role === 'hospital') {
    await addDoc(collection(db, 'hospitals'), {
      adminId: userCredential.user.uid,
      name: name,
      coords: { lat: 0, lng: 0 }, // Will be updated
      address: '',
      bloodStock: {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
      },
      icuBeds: 0,
      otAvailability: true,
      specialization: [],
      createdAt: new Date(),
    });
  }

  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  
  // Check if user profile exists
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      name: userCredential.user.displayName || 'User',
      role: 'patient', // Default role
      rewardPoints: 0,
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
  }
  
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  await setDoc(doc(db, 'users', uid), updates, { merge: true });
};
