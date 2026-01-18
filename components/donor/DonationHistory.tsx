'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function DonationHistory() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  const loadDonations = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'donations'),
        where('donorId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const donationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonations(donationsData);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No donation history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <Card key={donation.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {formatDate(donation.date?.toDate() || new Date())}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="mr-2 h-3 w-3" />
                  {donation.hospitalName || 'Hospital'}
                </div>
                {donation.pointsEarned && (
                  <div className="flex items-center text-sm">
                    <Award className="mr-2 h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-600 font-semibold">
                      +{donation.pointsEarned} points
                    </span>
                  </div>
                )}
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            {donation.certificateURL && (
              <div className="mt-3 pt-3 border-t">
                <a
                  href={donation.certificateURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Certificate
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
