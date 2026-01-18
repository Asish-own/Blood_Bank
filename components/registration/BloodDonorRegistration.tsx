'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function BloodDonorRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    phone: '',
    address: '',
    donationHistory: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return false;
    }
    const age = parseInt(formData.age);
    if (!formData.age || age < 18 || age > 65) {
      toast({ title: 'Error', description: 'Age must be between 18 and 65', variant: 'destructive' });
      return false;
    }
    if (!formData.bloodGroup) {
      toast({ title: 'Error', description: 'Blood group is required', variant: 'destructive' });
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast({ title: 'Error', description: 'Valid 10-digit phone number is required', variant: 'destructive' });
      return false;
    }
    if (!formData.address.trim()) {
      toast({ title: 'Error', description: 'Address is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/register/donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Success',
        description: 'Blood donor registration completed successfully!',
      });

      // Reset form
      setFormData({
        name: '',
        age: '',
        bloodGroup: '',
        phone: '',
        address: '',
        donationHistory: '',
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
        <CardTitle>Blood Donor Registration</CardTitle>
        <CardDescription>
          Register as a blood donor to help save lives in emergencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="18"
                max="65"
                value={formData.age}
                onChange={handleChange}
                placeholder="18-65"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) => handleSelectChange('bloodGroup', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your full address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donationHistory">Donation History (Optional)</Label>
            <textarea
              id="donationHistory"
              name="donationHistory"
              value={formData.donationHistory}
              onChange={handleChange}
              placeholder="Previous donation dates, any medical conditions, etc."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register as Donor'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
