const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function: Auto-update ambulance location in RTDB for real-time tracking
exports.updateAmbulanceLocation = functions.firestore
  .document('ambulances/{ambulanceId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const ambulanceId = context.params.ambulanceId;

    if (newData.coords) {
      // Update Realtime Database for faster real-time updates
      const rtdb = admin.database();
      await rtdb.ref(`ambulances/${ambulanceId}/location`).set({
        lat: newData.coords.lat,
        lng: newData.coords.lng,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });
    }

    return null;
  });

// Cloud Function: Auto-assign reward points after donation completion
exports.processDonationReward = functions.firestore
  .document('donations/{donationId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if donation was just completed
    if (before.status !== 'completed' && after.status === 'completed') {
      const donorId = after.donorId;
      const pointsEarned = after.pointsEarned || 50;

      // Update user reward points
      const userRef = admin.firestore().doc(`users/${donorId}`);
      await userRef.update({
        rewardPoints: admin.firestore.FieldValue.increment(pointsEarned),
      });

      // Generate digital certificate (in production, use Cloud Storage)
      const certificateURL = `https://lifelink-ai.app/certificates/${context.params.donationId}`;
      await admin.firestore().doc(`donations/${context.params.donationId}`).update({
        certificateURL,
      });
    }

    return null;
  });

// Cloud Function: Alert hospital when ambulance is dispatched
exports.alertHospital = functions.firestore
  .document('SOS_cases/{caseId}')
  .onCreate(async (snapshot, context) => {
    const caseData = snapshot.data();
    const hospitalId = caseData.hospitalId;

    if (hospitalId) {
      // In production, send push notification or email to hospital
      console.log(`Alerting hospital ${hospitalId} about incoming emergency case ${context.params.caseId}`);
      
      // Update hospital's incoming cases count
      const hospitalRef = admin.firestore().doc(`hospitals/${hospitalId}`);
      await hospitalRef.update({
        incomingCases: admin.firestore.FieldValue.increment(1),
      });
    }

    return null;
  });

// Cloud Function: Calculate and update GHS score periodically
exports.updateGHSScore = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { caseId } = data;
  if (!caseId) {
    throw new functions.https.HttpsError('invalid-argument', 'caseId is required');
  }

  const caseDoc = await admin.firestore().doc(`SOS_cases/${caseId}`).get();
  if (!caseDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Case not found');
  }

  const caseData = caseDoc.data();
  
  // Calculate ETA (simplified)
  const ambulanceDoc = await admin.firestore().doc(`ambulances/${caseData.ambulanceId}`).get();
  const ambulanceData = ambulanceDoc.data();
  
  // Calculate distance and ETA
  const distance = calculateDistance(
    ambulanceData.coords.lat,
    ambulanceData.coords.lng,
    caseData.location.lat,
    caseData.location.lng
  );
  const etaMinutes = Math.ceil(distance * 2);

  // Get hospital data
  const hospitalDoc = await admin.firestore().doc(`hospitals/${caseData.hospitalId}`).get();
  const hospitalData = hospitalDoc.data();

  // Calculate GHS score (simplified)
  let score = 100;
  score -= etaMinutes * 2; // Time penalty
  if (!hospitalData.bloodStock[caseData.bloodGroup] > 0) score -= 20;
  if (hospitalData.icuBeds === 0) score -= 15;
  score = Math.max(0, Math.min(100, score));

  // Update case with new GHS score
  await admin.firestore().doc(`SOS_cases/${caseId}`).update({
    ghsScore: score,
    eta: `${etaMinutes} minutes`,
  });

  return { score, eta: `${etaMinutes} minutes` };
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
