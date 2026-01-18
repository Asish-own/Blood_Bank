'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Activity, Heart } from 'lucide-react';

interface EmergencyStatusProps {
  emergency: any;
}

export function EmergencyStatus({ emergency }: EmergencyStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-blue-500';
      case 'arriving':
        return 'bg-yellow-500';
      case 'picked':
        return 'bg-orange-500';
      case 'reached':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Emergency Status</span>
          <Badge className={getStatusColor(emergency.status)}>
            {emergency.status?.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            ETA: <strong>{emergency.eta || 'Calculating...'}</strong>
          </span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Hospital: <strong>{emergency.hospitalName || 'Selected'}</strong>
          </span>
        </div>
        {emergency.ghsScore && (
          <div className="flex items-center">
            <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Survival Score: <strong>{emergency.ghsScore}%</strong>
            </span>
          </div>
        )}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Case ID: {emergency.id?.substring(0, 8)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
