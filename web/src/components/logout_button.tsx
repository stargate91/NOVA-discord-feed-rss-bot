"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import styles from "./logout_button.module.css";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className={styles["logout-btn"]}
    >
      <LogOut size={20} />
      <span className={styles["link-text"]}>Logout</span>
    </button>
  );
}
