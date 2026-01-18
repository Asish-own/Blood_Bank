'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ambulance, Clock, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IncomingAmbulancesProps {
  cases: any[];
}

export function IncomingAmbulances({ cases }: IncomingAmbulancesProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No incoming ambulances</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Card key={caseItem.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <Ambulance className="mr-2 h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold">Emergency Case</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {caseItem.id?.substring(0, 8)}...
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(caseItem.status)}>
                {caseItem.status?.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>ETA: {caseItem.eta || 'Calculating...'}</span>
              </div>
              {caseItem.bloodGroup && (
                <div className="flex items-center">
                  <span className="text-muted-foreground">Blood Group: </span>
                  <Badge className="ml-2 bg-red-500">{caseItem.bloodGroup}</Badge>
                </div>
              )}
              {caseItem.ghsScore && (
                <div className="flex items-center">
                  <span className="text-muted-foreground">Survival Score: </span>
                  <span className="ml-2 font-semibold">{caseItem.ghsScore}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'dispatched':
      return 'bg-blue-500';
    case 'arriving':
      return 'bg-yellow-500';
    case 'picked':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}
