"use client";

import React, { Suspense } from 'react';
import { useInviteCallback } from '@/hooks/use_invite_callback';
import styles from './invite_callback.module.css';

function InviteCallbackContent() {
  useInviteCallback();

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

