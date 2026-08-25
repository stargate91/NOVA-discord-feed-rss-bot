"use client";

import React, { Suspense } from "react";
import { useAuthErrorRedirect } from "@/hooks/use_auth_error";
import styles from "./error.module.css";

function AuthErrorContent() {
  useAuthErrorRedirect();

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
