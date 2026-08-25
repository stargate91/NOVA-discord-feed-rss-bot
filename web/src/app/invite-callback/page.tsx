"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './invite_callback.module.css';

function InviteCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guildId = searchParams?.get('guild_id');

  useEffect(() => {
    // If we have a guild_id, redirect to dashboard for that guild
    // Otherwise just go to the selector
    if (guildId) {
      router.push(`/dashboard/${guildId}`);
    } else {
      router.push('/servers');
    }
  }, [guildId, router]);

  return (
    <div className={styles['callback-container']}>
      <h2 className={styles['callback-title']}>Success!</h2>
      <p className={styles['callback-text']}>Redirecting you back to NovaFeeds Dashboard...</p>
      <div className={`ui-loader-simple ${styles['callback-loader']}`} />
    </div>
  );
}

export default function InviteCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteCallbackContent />
    </Suspense>
  );
}
