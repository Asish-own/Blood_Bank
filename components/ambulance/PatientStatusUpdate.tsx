'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateEmergencyStatus } from '@/lib/services/emergencyService';

interface PatientStatusUpdateProps {
  caseId: string;
}

const STATUSES = [
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'arriving', label: 'Arriving' },
  { value: 'picked', label: 'Picked Up' },
  { value: 'reached', label: 'Reached Hospital' },
];

export function PatientStatusUpdate({ caseId }: PatientStatusUpdateProps) {
  const [bloodGroup, setBloodGroup] = useState('');
  const [currentStatus, setCurrentStatus] = useState('dispatched');
  const { toast } = useToast();

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateEmergencyStatus(caseId, status as any);
      setCurrentStatus(status);
      toast({
        title: 'Status Updated',
        description: `Status changed to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleBloodGroupSubmit = async () => {
    if (!bloodGroup) {
      toast({
        title: 'Error',
        description: 'Please enter blood group',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateEmergencyStatus(caseId, currentStatus as any, {
        bloodGroup,
      });
      toast({
        title: 'Success',
        description: 'Blood group updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update blood group',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Blood Group Test Result</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., O+"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value.toUpperCase())}
            />
            <Button onClick={handleBloodGroupSubmit} size="sm">
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Case Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((status) => (
              <Button
                key={status.value}
                variant={currentStatus === status.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusUpdate(status.value)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
