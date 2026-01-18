'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MapPin, Clock, Activity } from 'lucide-react';
import { SOSButton } from '@/components/patient/SOSButton';
import { LiveTrackingMap } from '@/components/patient/LiveTrackingMap';
import { EmergencyStatus } from '@/components/patient/EmergencyStatus';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [activeEmergency, setActiveEmergency] = useState<any>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Listen for user's emergency cases
    const q = query(
      collection(db, 'SOS_cases'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const active = cases.find(c => c.status !== 'reached');
      setActiveEmergency(active || null);
      setEmergencyHistory(cases.filter(c => c.status === 'reached'));
    }, (error) => {
      console.error('Error listening to emergency cases:', error);
    });

    return () => unsubscribe();
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Emergency Dashboard</h1>
          <p className="text-muted-foreground">Quick access to emergency services</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Tracking</CardTitle>
              <CardDescription>Real-time ambulance location</CardDescription>
            </CardHeader>
            <CardContent>
              {activeEmergency ? (
                <LiveTrackingMap emergency={activeEmergency} />
              ) : (
                <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">No active emergency</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <SOSButton onEmergencyCreated={setActiveEmergency} />
            
            {activeEmergency && (
              <EmergencyStatus emergency={activeEmergency} />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/chatbot">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Hospitals
                  </Button>
                </Link>
                <Link href="/chatbot">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    AI Assistant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Emergency History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-1">{emergencyHistory.length}</p>
              <p className="text-sm text-muted-foreground">Past emergency cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-500" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">4.2 min</p>
              <p className="text-sm text-muted-foreground">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-sm text-muted-foreground">Based on your profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
