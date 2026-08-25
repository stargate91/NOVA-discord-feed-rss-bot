import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding Guide | NovaFeeds Dashboard",
  description: "Learn how to configure NovaFeeds monitors, alerts, and settings.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
