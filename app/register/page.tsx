'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BloodDonorRegistration } from '@/components/registration/BloodDonorRegistration';
import { BloodReceiverRegistration } from '@/components/registration/BloodReceiverRegistration';
import { AmbulanceDriverRegistration } from '@/components/registration/AmbulanceDriverRegistration';
import { HospitalRegistration } from '@/components/registration/HospitalRegistration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold mb-2">Registration</h1>
          <p className="text-muted-foreground">
            Register as a donor, receiver, ambulance driver, or hospital
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="donor" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="donor">Blood Donor</TabsTrigger>
              <TabsTrigger value="receiver">Blood Receiver</TabsTrigger>
              <TabsTrigger value="ambulance">Ambulance Driver</TabsTrigger>
              <TabsTrigger value="hospital">Hospital</TabsTrigger>
            </TabsList>

            <TabsContent value="donor">
              <BloodDonorRegistration />
            </TabsContent>

            <TabsContent value="receiver">
              <BloodReceiverRegistration />
            </TabsContent>

            <TabsContent value="ambulance">
              <AmbulanceDriverRegistration />
            </TabsContent>

            <TabsContent value="hospital">
              <HospitalRegistration />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
