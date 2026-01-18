'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Droplet } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function BloodStockManagement() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [bloodStock, setBloodStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBloodStock();
    }
  }, [user]);

  const loadBloodStock = async () => {
    if (!user) return;
    try {
      const hospitalDoc = await getDoc(doc(db, 'hospitals', user.uid));
      if (hospitalDoc.exists()) {
        setBloodStock(hospitalDoc.data().bloodStock || {});
      }
    } catch (error) {
      console.error('Error loading blood stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (bloodType: string, amount: number) => {
    if (!user) return;
    setUpdating(bloodType);
    try {
      const newStock = { ...bloodStock, [bloodType]: amount };
      await updateDoc(doc(db, 'hospitals', user.uid), {
        bloodStock: newStock,
      });
      setBloodStock(newStock);
      toast({
        title: 'Success',
        description: `${bloodType} stock updated`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-4">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Droplet className="mr-2 h-5 w-5 text-red-500" />
          Blood Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {BLOOD_GROUPS.map((bg) => (
          <div key={bg} className="flex items-center justify-between">
            <Label className="w-16">{bg}</Label>
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="number"
                value={bloodStock[bg] || 0}
                onChange={(e) => {
                  const newStock = { ...bloodStock, [bg]: parseInt(e.target.value) || 0 };
                  setBloodStock(newStock);
                }}
                className="flex-1"
                min="0"
              />
              <Button
                size="sm"
                onClick={() => updateStock(bg, bloodStock[bg] || 0)}
                disabled={updating === bg}
              >
                {updating === bg ? '...' : 'Update'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
