import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';

export async function bookDonation(data: {
  hospitalId: string;
  date: string;
  time: string;
}) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error('User not authenticated');

  // Get hospital name
  const hospitalDoc = await import('firebase/firestore').then(m => 
    m.getDoc(m.doc(db, 'hospitals', data.hospitalId))
  );
  const hospitalData = hospitalDoc.data();

  const donation = {
    donorId: user.uid,
    hospitalId: data.hospitalId,
    hospitalName: hospitalData?.name,
    date: new Date(data.date),
    time: data.time,
    status: 'scheduled',
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'donations'), donation);
  return docRef.id;
}

export async function completeDonation(donationId: string, points: number = 50) {
  const donationRef = doc(db, 'donations', donationId);
  const { user } = useAuthStore.getState();
  if (!user) throw new Error('User not authenticated');

  // Update donation status
  await updateDoc(donationRef, {
    status: 'completed',
    completedAt: new Date(),
    pointsEarned: points,
  });

  // Update user reward points
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    rewardPoints: increment(points),
  });

  // Update hospital blood stock (would be done by hospital staff)
  // This is handled in the hospital dashboard
}
