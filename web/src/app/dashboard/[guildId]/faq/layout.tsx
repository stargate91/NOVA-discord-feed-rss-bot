import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | NovaFeeds Dashboard",
  description: "Frequently asked questions and answers about NovaFeeds.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
