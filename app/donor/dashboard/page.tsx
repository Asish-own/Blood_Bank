'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, MapPin, Award, Calendar, History } from 'lucide-react';
import { DonationBooking } from '@/components/donor/DonationBooking';
import { DonationHistory } from '@/components/donor/DonationHistory';
import { RewardWallet } from '@/components/donor/RewardWallet';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function DonorDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'book' | 'history' | 'rewards'>('book');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Donor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile.name}</p>
            </div>
            <Badge className="bg-pink-500 text-white text-lg px-4 py-2">
              {profile.bloodGroup || 'Not Set'}
            </Badge>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reward Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold">{profile.rewardPoints || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Droplet className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-3xl font-bold">12</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lives Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Droplet className="mr-2 h-5 w-5 text-pink-500" />
                <span className="text-3xl font-bold">36</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold">Available</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === 'book' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('book')}
                >
                  Book Donation
                </Button>
                <Button
                  variant={activeTab === 'history' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('history')}
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                <Button
                  variant={activeTab === 'rewards' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('rewards')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Rewards
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'book' && <DonationBooking />}
              {activeTab === 'history' && <DonationHistory />}
              {activeTab === 'rewards' && <RewardWallet />}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Donation</p>
                  <p className="font-semibold">2 months ago</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Donation Streak</p>
                  <p className="font-semibold">3 months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="font-semibold">12 digital certificates</p>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card backdrop-blur-md">
              <CardHeader>
                <CardTitle>AI Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Based on your donation history, you're eligible for donation now!
                </p>
                <Link href="/chatbot">
                  <Button className="w-full">View Recommendations</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
