'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AmbulanceDriverRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    driverName: '',
    ambulanceNumber: '',
    serviceArea: '',
    phone: '',
    availability: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.driverName.trim()) {
      toast({ title: 'Error', description: 'Driver name is required', variant: 'destructive' });
      return false;
    }
    if (!formData.ambulanceNumber.trim()) {
      toast({ title: 'Error', description: 'Ambulance number is required', variant: 'destructive' });
      return false;
    }
    if (!formData.serviceArea.trim()) {
      toast({ title: 'Error', description: 'Service area is required', variant: 'destructive' });
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast({ title: 'Error', description: 'Valid 10-digit phone number is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/register/ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Success',
        description: 'Ambulance driver registration completed successfully!',
      });

      // Reset form
      setFormData({
        driverName: '',
        ambulanceNumber: '',
        serviceArea: '',
        phone: '',
        availability: true,
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
        <CardTitle>Ambulance Driver Registration</CardTitle>
        <CardDescription>
          Register your ambulance service to help in emergency situations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driverName">Driver Name *</Label>
            <Input
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              placeholder="Enter driver's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ambulanceNumber">Ambulance Number *</Label>
            <Input
              id="ambulanceNumber"
              name="ambulanceNumber"
              value={formData.ambulanceNumber}
              onChange={handleChange}
              placeholder="Vehicle registration number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceArea">Service Area *</Label>
            <Input
              id="serviceArea"
              name="serviceArea"
              value={formData.serviceArea}
              onChange={handleChange}
              placeholder="Areas you can service (e.g., Berhampur, Ganjam)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="availability"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="availability" className="cursor-pointer">
              Currently Available
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Ambulance'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
