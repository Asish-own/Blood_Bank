'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function BloodReceiverRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    hospitalName: '',
    requiredBloodGroup: '',
    urgencyLevel: '',
    phoneNumber: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      toast({ title: 'Error', description: 'Patient name is required', variant: 'destructive' });
      return false;
    }
    if (!formData.hospitalName.trim()) {
      toast({ title: 'Error', description: 'Hospital name is required', variant: 'destructive' });
      return false;
    }
    if (!formData.requiredBloodGroup) {
      toast({ title: 'Error', description: 'Required blood group is required', variant: 'destructive' });
      return false;
    }
    if (!formData.urgencyLevel) {
      toast({ title: 'Error', description: 'Urgency level is required', variant: 'destructive' });
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber)) {
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
      const response = await fetch('/api/register/receiver', {
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
        description: 'Blood receiver registration completed successfully! We will notify available donors.',
      });

      // Reset form
      setFormData({
        patientName: '',
        hospitalName: '',
        requiredBloodGroup: '',
        urgencyLevel: '',
        phoneNumber: '',
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
        <CardTitle>Blood Receiver Registration</CardTitle>
        <CardDescription>
          Register a patient in need of blood transfusion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name *</Label>
            <Input
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              placeholder="Name of the hospital"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredBloodGroup">Required Blood Group *</Label>
              <Select
                value={formData.requiredBloodGroup}
                onValueChange={(value) => handleSelectChange('requiredBloodGroup', value)}
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

            <div className="space-y-2">
              <Label htmlFor="urgencyLevel">Urgency Level *</Label>
              <Select
                value={formData.urgencyLevel}
                onValueChange={(value) => handleSelectChange('urgencyLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Contact Phone Number *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Blood Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
