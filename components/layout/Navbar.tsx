'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/firebase/auth';
import { Heart, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function Navbar() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const getDashboardPath = () => {
    if (!profile) return '/';
    const role = profile.role;
    if (role === 'donor') return '/donor/dashboard';
    if (role === 'ambulance') return '/ambulance/dashboard';
    if (role === 'hospital') return '/hospital/dashboard';
    if (role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="font-bold text-xl">LifeLink AI</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href={getDashboardPath()}>
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
