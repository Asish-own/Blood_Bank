'use client';

import { CustomMap } from '@/components/map/CustomMap';
import { Card } from '@/components/ui/card';

interface HospitalMapProps {
  hospital: any;
}

export function HospitalMap({ hospital }: HospitalMapProps) {
  return (
    <Card className="w-full">
      <CustomMap showHospital={true} showAmbulances={false} />
      {hospital?.name && (
        <div className="p-4 border-t">
          <h3 className="font-semibold">{hospital.name}</h3>
          <p className="text-sm text-muted-foreground">Location: Berhampur, Odisha</p>
        </div>
      )}
    </Card>
  );
}
