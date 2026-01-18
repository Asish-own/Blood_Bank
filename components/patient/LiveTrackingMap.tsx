'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribeToEmergency } from '@/lib/services/emergencyService';
import { CustomMap } from '@/components/map/CustomMap';

interface LiveTrackingMapProps {
  emergency: any;
}

export function LiveTrackingMap({ emergency }: LiveTrackingMapProps) {
  const [emergencyStatus, setEmergencyStatus] = useState<any>(emergency);

  useEffect(() => {
    if (!emergency?.id) return;

    // Listen to real-time emergency updates
    const unsubscribe = subscribeToEmergency(emergency.id, (updatedEmergency) => {
      setEmergencyStatus(updatedEmergency);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [emergency?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Emergency Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomMap showHospital={true} showAmbulances={true} />
        {emergencyStatus && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Emergency Status: {emergencyStatus.status || 'Active'}</span>
            </div>
            {emergencyStatus.ambulanceId && (
              <div className="text-muted-foreground">
                Ambulance assigned and en route to MKCG Hospital
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
