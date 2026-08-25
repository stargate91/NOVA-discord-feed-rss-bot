import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Servers | NovaFeeds Dashboard",
  description: "Select a Discord server to configure feed monitors, notifications, and alerts.",
};

export default function ServersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
