import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Plans | NovaFeeds Dashboard",
  description: "Manage subscription plans and features for your Discord server.",
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
