'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { createSOSCase } from '@/lib/services/emergencyService';

interface SOSButtonProps {
  onEmergencyCreated: (emergency: any) => void;
}

export function SOSButton({ onEmergencyCreated }: SOSButtonProps) {
  const { user, profile } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleSOS = async () => {
    if (!user || !profile) {
      toast({
        title: 'Error',
        description: 'Please sign in to use SOS',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setPressed(true);

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Create SOS case
      const emergency = await createSOSCase({
        userId: user.uid,
        location,
        bloodGroup: profile.bloodGroup,
      });

      onEmergencyCreated(emergency);
      toast({
        title: 'SOS Activated',
        description: 'Ambulance has been dispatched. Help is on the way!',
      });
    } catch (error: any) {
      console.error('SOS error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate SOS. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setPressed(false), 200);
    }
  };

  return (
    <Card className="gradient-card backdrop-blur-md border-red-500/50">
      <CardContent className="p-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-center"
        >
          <motion.div
            animate={pressed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" fill="currentColor" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Emergency SOS</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Press the button below to request immediate emergency assistance
          </p>
          <Button
            size="lg"
            className="w-full bg-red-500 hover:bg-red-600 text-white sos-button"
            onClick={handleSOS}
            disabled={loading}
          >
            {loading ? 'Activating SOS...' : 'ACTIVATE SOS'}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
