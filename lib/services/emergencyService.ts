import { collection, addDoc, doc, updateDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { selectBestHospital, calculateGHSScore } from '@/lib/gemini/client_gemini_backup';
import { calculateDistance } from '@/lib/utils';

export interface SOSCase {
  id?: string;
  userId: string;
  location: { lat: number; lng: number };
  bloodGroup?: string;
  status: 'pending' | 'dispatched' | 'arriving' | 'picked' | 'reached';
  ambulanceId?: string;
  hospitalId?: string;
  hospitalName?: string;
  hospitalLocation?: { lat: number; lng: number };
  ambulanceLocation?: { lat: number; lng: number };
  eta?: string;
  ghsScore?: number;
  createdAt: Date;
}

export async function createSOSCase(data: {
  userId: string;
  location: { lat: number; lng: number };
  bloodGroup?: string;
}): Promise<SOSCase> {
  // 1. Find nearest available ambulance
  const ambulancesQuery = query(
    collection(db, 'ambulances'),
    where('status', '==', 'available')
  );
  const ambulancesSnapshot = await getDocs(ambulancesQuery);
  
  let nearestAmbulance: any = null;
  let minDistance = Infinity;

  ambulancesSnapshot.forEach((doc) => {
    const ambulance = doc.data();
    if (ambulance.coords) {
      const distance = calculateDistance(
        data.location.lat,
        data.location.lng,
        ambulance.coords.lat,
        ambulance.coords.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestAmbulance = { id: doc.id, ...ambulance };
      }
    }
  });

  if (!nearestAmbulance) {
    throw new Error('No available ambulances at the moment');
  }

  // 2. Find hospitals with ICU and blood availability
  const hospitalsSnapshot = await getDocs(collection(db, 'hospitals'));
  const hospitals: any[] = [];
  
  hospitalsSnapshot.forEach((doc) => {
    const hospital = doc.data();
    if (hospital.coords) {
      const distance = calculateDistance(
        data.location.lat,
        data.location.lng,
        hospital.coords.lat,
        hospital.coords.lng
      );
      hospitals.push({
        id: doc.id,
        name: hospital.name,
        distance,
        icuBeds: hospital.icuBeds || 0,
        bloodStock: hospital.bloodStock || {},
        specialization: hospital.specialization || [],
        coords: hospital.coords,
      });
    }
  });

  // 3. Use AI to select best hospital
  const bestHospitalId = await selectBestHospital(hospitals, data.bloodGroup);
  const bestHospital = hospitals.find(h => h.id === bestHospitalId);

  // 4. Calculate GHS Score
  const etaMinutes = Math.ceil(minDistance * 2); // Rough estimate: 2 min per km
  const ghsResult = await calculateGHSScore(
    etaMinutes,
    bestHospital?.bloodStock[data.bloodGroup || 'O+'] > 0 || false,
    (bestHospital?.icuBeds || 0) > 0,
    bestHospital?.distance || 0
  );

  // 5. Create SOS case
  const sosCase: Omit<SOSCase, 'id'> = {
    userId: data.userId,
    location: data.location,
    bloodGroup: data.bloodGroup,
    status: 'dispatched',
    ambulanceId: nearestAmbulance.id,
    hospitalId: bestHospitalId,
    hospitalName: bestHospital?.name,
    hospitalLocation: bestHospital?.coords,
    ambulanceLocation: nearestAmbulance.coords,
    eta: `${etaMinutes} minutes`,
    ghsScore: ghsResult.score,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'SOS_cases'), sosCase);

  // 6. Update ambulance status
  await updateDoc(doc(db, 'ambulances', nearestAmbulance.id), {
    status: 'assigned',
    assignedCase: docRef.id,
  });

  // 7. Alert hospital (in production, this would be a Cloud Function trigger)
  
  return { id: docRef.id, ...sosCase };
}

export function subscribeToEmergency(emergencyId: string, callback: (emergency: SOSCase) => void) {
  return onSnapshot(
    doc(db, 'SOS_cases', emergencyId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as SOSCase);
      }
    }
  );
}

export async function updateEmergencyStatus(
  emergencyId: string,
  status: SOSCase['status'],
  updates?: Partial<SOSCase>
) {
  await updateDoc(doc(db, 'SOS_cases', emergencyId), {
    status,
    ...updates,
  });
}
