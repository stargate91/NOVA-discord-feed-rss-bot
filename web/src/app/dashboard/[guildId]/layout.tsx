import React, { Suspense } from "react";
import SidebarWrapper from "@/components/SidebarWrapper";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import FloatingHelp from "@/components/FloatingHelp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  return (
    <div className="app-container">
      <Suspense fallback={<aside className="sidebar"></aside>}>
        <SidebarWrapper session={session} isMaster={isMaster} />
      </Suspense>
      <main className="main-content app-grid-bg" style={{ padding: '2rem' }}>
        <AnnouncementBanner />
        {children}
      </main>
      <Suspense fallback={null}>
        <FloatingHelp />
      </Suspense>
    </div>
  );
}
