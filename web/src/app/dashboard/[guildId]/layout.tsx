import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/layout";
import AnnouncementBanner from "@/components/announcement_banner";
import FloatingHelp from "@/components/floating_help";
import { requireGuildDashboardAuth } from "@/lib/auth";

export default async function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { session, isMaster } = await requireGuildDashboardAuth(params);

  return (
    <DashboardLayout session={session} isMaster={isMaster}>
      <AnnouncementBanner />
      {children}
      <Suspense fallback={null}>
        <FloatingHelp />
      </Suspense>
    </DashboardLayout>
  );
}
