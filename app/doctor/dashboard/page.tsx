'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Calendar, Clock, Users } from 'lucide-react';
import { AppointmentSchedule } from '@/components/doctor/AppointmentSchedule';
import { AppointmentList } from '@/components/doctor/AppointmentList';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Navbar } from '@/components/layout/Navbar';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(apps);
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

  const todayAppointments = appointments.filter(apt => {
    const aptDate = apt.date?.toDate();
    if (!aptDate) return false;
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your appointments and schedule</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">{todayAppointments.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{appointments.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold">12</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Specialization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-purple-500" />
                <span className="text-lg font-semibold">Cardiology</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Manage your patient appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentList appointments={appointments} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentSchedule />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
