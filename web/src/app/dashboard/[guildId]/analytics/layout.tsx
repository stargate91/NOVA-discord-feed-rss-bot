import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | NovaFeeds Dashboard",
  description: "View feed monitor delivery statistics, charts, and activity heatmaps.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
