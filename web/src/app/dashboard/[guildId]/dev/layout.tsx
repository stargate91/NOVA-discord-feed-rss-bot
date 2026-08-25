import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dev Controls | NovaFeeds Dashboard",
  description: "Master administrative developer tools and system controls.",
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
