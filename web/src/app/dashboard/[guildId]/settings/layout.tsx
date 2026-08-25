import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Server Settings | NovaFeeds Dashboard",
  description: "Configure Discord server settings, admin roles, languages, intervals, and templates.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
