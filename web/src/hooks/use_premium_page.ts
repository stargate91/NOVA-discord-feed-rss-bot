import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { TIERS, TierItem } from '@/constants/tiers';

export type BillingInterval = 'mo' | 'yr';

export function usePremiumPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('mo');

  const handlePurchaseClick = (_tier: number) => {
    if (!session) {
      signIn('discord', { callbackUrl: '/servers' });
      return;
    }
    router.push('/servers');
  };

  const getTierPrice = (tier: TierItem) => {
    return billingInterval === 'mo' ? tier.price.mo : tier.price.yr;
  };

  return {
    session,
    status,
    billingInterval,
    setBillingInterval,
    handlePurchaseClick,
    getTierPrice,
    tiers: TIERS,
  };
}
