'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function AppointmentSchedule() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');

  const createSlot = async () => {
    if (!user || !date || !time) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addDoc(collection(db, 'appointment_slots'), {
        doctorId: user.uid,
        date: new Date(date),
        time,
        duration: parseInt(duration),
        available: true,
        createdAt: new Date(),
      });
      toast({
        title: 'Success',
        description: 'Appointment slot created',
      });
      setDate('');
      setTime('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create slot',
        variant: 'destructive',
      });
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={minDate}
        />
      </div>
      <div className="space-y-2">
        <Label>Time</Label>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="15"
          step="15"
        />
      </div>
      <Button onClick={createSlot} className="w-full">
        Create Slot
      </Button>
    </div>
  );
}
