'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { HospitalMap } from '@/components/donor/HospitalMap';
import { bookDonation } from '@/lib/services/donationService';

export function DonationBooking() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'hospitals'));
      const hospitalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedHospital || !selectedDate || !selectedTime) {
      toast({
        title: 'Error',
        description: 'Please select hospital, date, and time',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await bookDonation({
        hospitalId: selectedHospital.id,
        date: selectedDate,
        time: selectedTime,
      });
      toast({
        title: 'Success',
        description: 'Donation slot booked successfully!',
      });
      setSelectedDate('');
      setSelectedTime('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to book donation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Hospital</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {hospitals.map((hospital) => (
            <Card
              key={hospital.id}
              className={`cursor-pointer transition-all ${
                selectedHospital?.id === hospital.id
                  ? 'border-primary border-2'
                  : ''
              }`}
              onClick={() => setSelectedHospital(hospital)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{hospital.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="mr-1 h-3 w-3" />
                      {hospital.address || 'Location available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedHospital && (
        <>
          <HospitalMap hospital={selectedHospital} />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="inline mr-2 h-4 w-4" />
                Select Date
              </Label>
              <Input
                id="date"
                type="date"
                min={minDateStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="inline mr-2 h-4 w-4" />
                Select Time
              </Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleBooking}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Booking...' : 'Book Donation Slot'}
          </Button>
        </>
      )}
    </div>
  );
}
