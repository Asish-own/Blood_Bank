'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';

export function ICUBedManagement() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [icuBeds, setIcuBeds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadICUBeds();
    }
  }, [user]);

  const loadICUBeds = async () => {
    if (!user) return;
    try {
      const hospitalDoc = await getDoc(doc(db, 'hospitals', user.uid));
      if (hospitalDoc.exists()) {
        setIcuBeds(hospitalDoc.data().icuBeds || 0);
      }
    } catch (error) {
      console.error('Error loading ICU beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateICUBeds = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'hospitals', user.uid), {
        icuBeds,
      });
      toast({
        title: 'Success',
        description: 'ICU bed count updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ICU beds',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Card><CardContent className="p-4">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-blue-500" />
          ICU Beds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Available ICU Beds</Label>
          <Input
            type="number"
            value={icuBeds}
            onChange={(e) => setIcuBeds(parseInt(e.target.value) || 0)}
            min="0"
            className="mt-2"
          />
        </div>
        <Button onClick={updateICUBeds} className="w-full">
          Update ICU Beds
        </Button>
      </CardContent>
    </Card>
  );
}
