'use client';

import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Gift, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REWARDS = [
  { id: 1, name: 'Free Health Checkup', points: 500, icon: Gift },
  { id: 2, name: 'Discount Voucher (10%)', points: 300, icon: ShoppingBag },
  { id: 3, name: 'Premium Membership', points: 1000, icon: Award },
];

export function RewardWallet() {
  const { profile } = useAuthStore();
  const { toast } = useToast();
  const points = profile?.rewardPoints || 0;

  const handleRedeem = (reward: typeof REWARDS[0]) => {
    if (points >= reward.points) {
      toast({
        title: 'Reward Redeemed!',
        description: `You've successfully redeemed ${reward.name}. Check your email for details.`,
      });
    } else {
      toast({
        title: 'Insufficient Points',
        description: `You need ${reward.points - points} more points to redeem this reward.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card backdrop-blur-md">
        <CardContent className="p-6">
          <div className="text-center">
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">{points}</h3>
            <p className="text-muted-foreground">Reward Points</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Available Rewards</h3>
        <div className="space-y-3">
          {REWARDS.map((reward) => {
            const Icon = reward.icon;
            const canRedeem = points >= reward.points;
            return (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reward.points} points
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={!canRedeem}
                      variant={canRedeem ? 'default' : 'outline'}
                      onClick={() => handleRedeem(reward)}
                    >
                      Redeem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
