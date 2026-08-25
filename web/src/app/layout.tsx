import React from "react";
import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "@/styles/index.css";
import "./globals.css";
import "./ui.css";
import AuthProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://novafeeds.xyz'),
  title: {
    default: "NovaFeeds Dashboard",
    template: "%s | NovaFeeds",
  },
  description: "Automated Discord feed bot for YouTube, Twitch, RSS, and more.",
  icons: {
    icon: [
      { url: "/nova_v2.jpg" },
      { url: "/icon.png" },
    ],
    shortcut: "/icon.png",
    apple: "/nova_v2.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
