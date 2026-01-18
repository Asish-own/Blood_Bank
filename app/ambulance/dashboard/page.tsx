'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ambulance, MapPin, Navigation, Activity } from 'lucide-react';
import { SOSAlert } from '@/components/ambulance/SOSAlert';
import { AmbulanceNavigation } from '@/components/ambulance/AmbulanceNavigation';
import { PatientStatusUpdate } from '@/components/ambulance/PatientStatusUpdate';
import { onSnapshot, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Navbar } from '@/components/layout/Navbar';

export default function AmbulanceDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [activeCase, setActiveCase] = useState<any>(null);
  const [ambulanceStatus, setAmbulanceStatus] = useState<'available' | 'assigned'>('available');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // First, find the ambulance document for this user
    const findAmbulance = async () => {
      try {
        const ambulancesQuery = query(
          collection(db, 'ambulances'),
          where('driverId', '==', user.uid)
        );
        
        const snapshot = await getDocs(ambulancesQuery);
        if (!snapshot.empty) {
          const ambulanceDoc = snapshot.docs[0];
          const ambulanceId = ambulanceDoc.id;

          // Listen for assigned cases
          const q = query(
            collection(db, 'SOS_cases'),
            where('ambulanceId', '==', ambulanceId)
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const active = cases.find(c => c.status !== 'reached');
            setActiveCase(active || null);
            setAmbulanceStatus(active ? 'assigned' : 'available');
          }, (error) => {
            console.error('Error listening to cases:', error);
          });

          return unsubscribe;
        } else {
          // Fallback: try matching by user ID directly
          const q = query(
            collection(db, 'SOS_cases'),
            where('ambulanceId', '==', user.uid)
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const active = cases.find(c => c.status !== 'reached');
            setActiveCase(active || null);
            setAmbulanceStatus(active ? 'assigned' : 'available');
          }, (error) => {
            console.error('Error listening to cases:', error);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error('Error finding ambulance:', error);
      }
    };

    const unsubscribePromise = findAmbulance();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Ambulance Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {profile?.name || 'Driver'}</p>
            </div>
            <Badge className={ambulanceStatus === 'available' ? 'bg-green-500' : 'bg-red-500'}>
              {ambulanceStatus === 'available' ? 'Available' : 'On Call'}
            </Badge>
          </div>
        </motion.div>

        {activeCase ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active Emergency Case</CardTitle>
                <CardDescription>Case ID: {activeCase.id?.substring(0, 8)}...</CardDescription>
              </CardHeader>
              <CardContent>
                <AmbulanceNavigation case={activeCase} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <SOSAlert case={activeCase} />
              <PatientStatusUpdate caseId={activeCase.id} />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Ambulance className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Cases</h3>
              <p className="text-muted-foreground">
                You're currently available. New emergency cases will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-blue-500" />
                Today's Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Completed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="mr-2 h-5 w-5 text-green-500" />
                Average Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">4.5 min</p>
              <p className="text-sm text-muted-foreground">Response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-purple-500" />
                Distance Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">127 km</p>
              <p className="text-sm text-muted-foreground">Total distance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
