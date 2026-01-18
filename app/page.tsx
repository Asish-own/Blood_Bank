'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Droplet, Ambulance, Hospital, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      const role = user.role;
      if (role === 'donor') router.push('/donor/dashboard');
      else if (role === 'ambulance') router.push('/ambulance/dashboard');
      else if (role === 'hospital') router.push('/hospital/dashboard');
      else if (role === 'doctor') router.push('/doctor/dashboard');
      else router.push('/patient/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="w-20 h-20 text-white" fill="currentColor" />
          </motion.div>
          <h1 className="text-6xl font-bold text-white mb-4">
            LifeLink AI
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Smart Emergency Coordination System
            <br />
            Connecting Lives, Saving Time, Saving Lives
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          <RoleCard
            icon={<Droplet className="w-8 h-8" />}
            title="Blood Donor"
            description="Register, book slots, earn rewards"
            href="/auth/signup?role=donor"
            gradient="from-pink-500 to-rose-500"
          />
          <RoleCard
            icon={<Heart className="w-8 h-8" />}
            title="Patient / Emergency"
            description="SOS button, live tracking, AI routing"
            href="/auth/signup?role=patient"
            gradient="from-red-500 to-pink-500"
          />
          <RoleCard
            icon={<Ambulance className="w-8 h-8" />}
            title="Ambulance Staff"
            description="Receive alerts, navigate, update status"
            href="/auth/signup?role=ambulance"
            gradient="from-orange-500 to-red-500"
          />
          <RoleCard
            icon={<Hospital className="w-8 h-8" />}
            title="Hospital / Blood Bank"
            description="Manage stock, ICU, accept emergencies"
            href="/auth/signup?role=hospital"
            gradient="from-purple-500 to-pink-500"
          />
          <RoleCard
            icon={<Stethoscope className="w-8 h-8" />}
            title="Doctor"
            description="Manage appointments, schedule"
            href="/auth/signup?role=doctor"
            gradient="from-blue-500 to-purple-500"
          />
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-x-4"
        >
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8 bg-white text-primary hover:bg-white/90">
              Get Started
            </Button>
          </Link>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Powered by AI</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard title="Predictive Analytics" description="AI-powered blood demand forecasting" />
            <FeatureCard title="Smart Routing" description="Optimal hospital selection using AI" />
            <FeatureCard title="Real-time Tracking" description="Live ambulance and patient monitoring" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  href,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white cursor-pointer shadow-xl`}
      >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="gradient-card rounded-xl p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
