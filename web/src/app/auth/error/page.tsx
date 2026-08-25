"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./error.module.css";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  useEffect(() => {
    // Redirect back to landing page with a clean error message
    // If it's a callback error (like 'Cancel' on Discord), we'll call it auth_cancelled
    const errorType = error === "Callback" ? "auth_cancelled" : "auth_error";
    router.push(`/?error=${errorType}`);
  }, [router, error]);

  return (
    <div className={styles["error-container"]}>
      <div className={styles["error-content"]}>
        <div className={`ui-loader-simple ${styles.loader}`} />
        <p className={styles["error-text"]}>Processing login error...</p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
