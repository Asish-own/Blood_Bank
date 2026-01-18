'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Clock, Heart } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SOSAlertProps {
  case: any;
}

export function SOSAlert({ case: emergencyCase }: SOSAlertProps) {
  return (
    <Card className="border-red-500 border-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
          Emergency Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Patient Location</p>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm">
              {emergencyCase.location?.lat?.toFixed(4)}, {emergencyCase.location?.lng?.toFixed(4)}
            </span>
          </div>
        </div>

        {emergencyCase.bloodGroup && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Blood Group Required</p>
            <Badge className="bg-red-500">{emergencyCase.bloodGroup}</Badge>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-1">Hospital</p>
          <p className="font-semibold">{emergencyCase.hospitalName || 'Selected'}</p>
        </div>

        {emergencyCase.ghsScore && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Survival Score</p>
            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4 text-red-500" />
              <span className="font-semibold">{emergencyCase.ghsScore}%</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Received: {formatDate(emergencyCase.createdAt?.toDate() || new Date())}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
