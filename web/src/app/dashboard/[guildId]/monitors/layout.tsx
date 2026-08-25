import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed Monitors | NovaFeeds Dashboard",
  description: "Configure and manage active feed monitors, alerts, and notifications.",
};

export default function MonitorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
