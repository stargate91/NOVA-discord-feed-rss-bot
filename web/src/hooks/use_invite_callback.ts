import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useInviteCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guildId = searchParams?.get('guild_id');

  useEffect(() => {
    if (guildId) {
      router.push(`/dashboard/${guildId}`);
    } else {
      router.push('/servers');
    }
  }, [guildId, router]);

  return {
    guildId,
  };
}
