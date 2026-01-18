'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function HospitalRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    address: '',
    emergencyContact: '',
    bloodStock: {
      'A+': '',
      'A-': '',
      'B+': '',
      'B-': '',
      'AB+': '',
      'AB-': '',
      'O+': '',
      'O-': '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (bloodGroups.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        bloodStock: {
          ...prev.bloodStock,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.hospitalName.trim()) {
      toast({ title: 'Error', description: 'Hospital name is required', variant: 'destructive' });
      return false;
    }
    if (!formData.address.trim()) {
      toast({ title: 'Error', description: 'Address is required', variant: 'destructive' });
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.emergencyContact || !phoneRegex.test(formData.emergencyContact)) {
      toast({ title: 'Error', description: 'Valid 10-digit emergency contact number is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert blood stock to numbers
      const bloodStock: Record<string, number> = {};
      bloodGroups.forEach((group) => {
        const value = formData.bloodStock[group as keyof typeof formData.bloodStock];
        bloodStock[group] = value ? parseInt(value) || 0 : 0;
      });

      const response = await fetch('/api/register/hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName: formData.hospitalName,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          bloodStock,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Success',
        description: 'Hospital registration completed successfully!',
      });

      // Reset form
      setFormData({
        hospitalName: '',
        address: '',
        emergencyContact: '',
        bloodStock: {
          'A+': '',
          'A-': '',
          'B+': '',
          'B-': '',
          'AB+': '',
          'AB-': '',
          'O+': '',
          'O-': '',
        },
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital Registration</CardTitle>
        <CardDescription>
          Register your hospital to manage blood stock and emergency cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name *</Label>
            <Input
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              placeholder="Enter hospital name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Hospital address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact *</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              type="tel"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="10-digit emergency contact number"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Blood Stock (Units Available - Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bloodGroups.map((group) => (
                <div key={group} className="space-y-2">
                  <Label htmlFor={group} className="text-sm">
                    {group}
                  </Label>
                  <Input
                    id={group}
                    name={group}
                    type="number"
                    min="0"
                    value={formData.bloodStock[group as keyof typeof formData.bloodStock]}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Hospital'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
