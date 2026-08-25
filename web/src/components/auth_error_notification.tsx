"use client";

import { Suspense } from "react";
import { useAuthErrorNotification } from "@/hooks/use_auth_error_notification";

function ErrorNotifier() {
  useAuthErrorNotification();
  return null;
}

export default function AuthErrorNotification() {
  return (
    <Suspense fallback={null}>
      <ErrorNotifier />
    </Suspense>
  );
}

