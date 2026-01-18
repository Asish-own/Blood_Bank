'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface AppointmentListProps {
  appointments: any[];
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No appointments scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <Card key={apt.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {apt.patientName || 'Patient'}
                </h4>
                <p className="text-sm text-muted-foreground">{apt.patientEmail}</p>
              </div>
              <Badge variant={apt.status === 'confirmed' ? 'default' : 'outline'}>
                {apt.status || 'Pending'}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{formatDate(apt.date?.toDate() || new Date())}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{apt.time || formatTime(apt.date?.toDate() || new Date())}</span>
              </div>
              {apt.mode && (
                <div>
                  <Badge variant="outline">{apt.mode}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
