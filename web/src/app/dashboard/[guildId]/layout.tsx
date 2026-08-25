import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/layout";
import AnnouncementBanner from "@/components/announcement_banner";
import FloatingHelp from "@/components/floating_help";
import { requireGuildDashboardAuth } from "@/lib/auth";
import { GuildProvider } from "@/context/guild_context";

export default async function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { session, isMaster, guildId } = await requireGuildDashboardAuth(params);

  return (
    <GuildProvider guildId={guildId} initialIsMaster={isMaster}>
      <DashboardLayout session={session} isMaster={isMaster}>
        <AnnouncementBanner />
        {children}
        <Suspense fallback={null}>
          <FloatingHelp />
        </Suspense>
      </DashboardLayout>
    </GuildProvider>
  );
}

