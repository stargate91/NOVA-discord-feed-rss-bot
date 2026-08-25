import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Plans & Pricing | NovaFeeds",
  description: "Upgrade your Discord server with fast update intervals, unlimited feeds, custom templates, and priority delivery.",
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
