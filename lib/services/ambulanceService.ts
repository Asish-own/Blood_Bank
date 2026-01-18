import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function updateAmbulanceLocation(
  ambulanceIdOrUserId: string,
  location: { lat: number; lng: number }
) {
  try {
    // Try to update directly if it's an ambulance ID
    try {
      await updateDoc(doc(db, 'ambulances', ambulanceIdOrUserId), {
        coords: location,
        lastUpdate: new Date(),
      });
      return;
    } catch (error) {
      // If that fails, try to find ambulance by driverId
      const q = query(
        collection(db, 'ambulances'),
        where('driverId', '==', ambulanceIdOrUserId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const ambulanceDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'ambulances', ambulanceDoc.id), {
          coords: location,
          lastUpdate: new Date(),
        });
      } else {
        console.error('Ambulance not found for ID:', ambulanceIdOrUserId);
      }
    }
  } catch (error) {
    console.error('Error updating ambulance location:', error);
  }
}

export async function updateAmbulanceStatus(
  ambulanceId: string,
  status: 'available' | 'assigned' | 'offline'
) {
  await updateDoc(doc(db, 'ambulances', ambulanceId), {
    status,
  });
}
