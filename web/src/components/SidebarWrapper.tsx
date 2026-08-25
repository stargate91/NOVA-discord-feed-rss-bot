"use client";

import React from "react";
import { useSearchParams, usePathname } from "next/navigation";
import MainSidebar from "./MainSidebar";

interface SidebarWrapperProps {
  session: any;
  isMaster: boolean;
}

export default function SidebarWrapper({ session, isMaster }: SidebarWrapperProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const guildId = searchParams?.get("guild");

  // Hide sidebar if no guild is selected AND we are on the premium page
  if (!guildId && pathname === "/premium") {
    return null;
  }

  // If session doesn't exist, safety return
  if (!session) return null;

  return <MainSidebar session={session} isMaster={isMaster} />;
}
