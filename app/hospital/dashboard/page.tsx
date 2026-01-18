'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, Droplet, Activity, Users } from 'lucide-react';
import { BloodStockManagement } from '@/components/hospital/BloodStockManagement';
import { ICUBedManagement } from '@/components/hospital/ICUBedManagement';
import { IncomingAmbulances } from '@/components/hospital/IncomingAmbulances';
import { onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Navbar } from '@/components/layout/Navbar';

export default function HospitalDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [incomingCases, setIncomingCases] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // First, find the hospital document for this user
    const findHospital = async () => {
      try {
        const hospitalsQuery = query(
          collection(db, 'hospitals'),
          where('adminId', '==', user.uid)
        );
        
        const snapshot = await getDocs(hospitalsQuery);
        if (!snapshot.empty) {
          const hospitalDoc = snapshot.docs[0];
          const hospitalId = hospitalDoc.id;

          // Listen for incoming emergency cases
          const q = query(
            collection(db, 'SOS_cases'),
            where('hospitalId', '==', hospitalId)
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const incoming = cases.filter(c => c.status !== 'reached');
            setIncomingCases(incoming);
          }, (error) => {
            console.error('Error listening to cases:', error);
          });

          return unsubscribe;
        } else {
          // Fallback: try matching by user ID directly
          const q = query(
            collection(db, 'SOS_cases'),
            where('hospitalId', '==', user.uid)
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const incoming = cases.filter(c => c.status !== 'reached');
            setIncomingCases(incoming);
          }, (error) => {
            console.error('Error listening to cases:', error);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error('Error finding hospital:', error);
      }
    };

    const unsubscribePromise = findHospital();
    
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Hospital Dashboard</h1>
          <p className="text-muted-foreground">Manage blood stock, ICU beds, and emergency cases</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Incoming Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-3xl font-bold">{incomingCases.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Blood Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Droplet className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-3xl font-bold">1,234</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ICU Beds Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Hospital className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">8</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Admissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">24</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Incoming Ambulances</CardTitle>
              <CardDescription>Real-time emergency cases</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomingAmbulances cases={incomingCases} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <BloodStockManagement />
            <ICUBedManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
