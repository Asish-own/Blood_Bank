'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { updateAmbulanceLocation } from '@/lib/services/ambulanceService';
import { CustomMap } from '@/components/map/CustomMap';
import { Card } from '@/components/ui/card';

interface AmbulanceNavigationProps {
  case: any;
}

export function AmbulanceNavigation({ case: emergencyCase }: AmbulanceNavigationProps) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    // Get current location (optional, for future GPS integration)
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (emergencyCase?.ambulanceId) {
            updateAmbulanceLocation(emergencyCase.ambulanceId, location).catch((error) => {
              console.error('Error updating ambulance location:', error);
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [emergencyCase]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Navigation</h3>
        <Button size="sm" variant="outline">
          <Navigation className="mr-2 h-4 w-4" />
          Active Navigation
        </Button>
      </div>
      <CustomMap showHospital={true} showAmbulances={true} />
      {emergencyCase && (
        <Card className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ambulance Status: Active</span>
            </div>
            <div className="text-muted-foreground">
              Destination: MKCG Medical College & Hospital, Berhampur
            </div>
            {emergencyCase.location && (
              <div className="text-muted-foreground">
                Patient Location: En route
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
