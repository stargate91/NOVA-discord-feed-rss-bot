import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import FloatingHelp from "@/components/FloatingHelp";

export default async function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const isMaster = (session?.user as any)?.role === "master";
  const { guildId } = await params;

  if (!guildId) {
    redirect("/servers");
  }

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
