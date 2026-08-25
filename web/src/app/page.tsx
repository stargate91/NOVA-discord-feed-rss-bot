import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Zap,
  Shield,
  Activity,
  Globe,
  Play,
  Rss,
  Layout,
  Rocket,
  Bot,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { PublicLayout } from "@/components/layout";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Heading,
  Text,
  Grid,
  Inline,
} from "@/components/ui";
import PlatformCarousel from "@/components/PlatformCarousel";
import LiveTicker from "@/components/LiveTicker";
import DiscordV2Preview from "@/components/DiscordV2Preview";
import AuthErrorNotification from "@/components/AuthErrorNotification";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "NovaFeeds | Ultimate Discord Feed & Alert Bot",
  description: "Real-time automated Discord feeds from YouTube, Twitch, Kick, Steam, RSS, Crypto and Free Game alerts delivered with high-fidelity embeds.",
  openGraph: {
    title: "NovaFeeds | Ultimate Discord Feed & Alert Bot",
    description: "Real-time automated Discord feeds with high-fidelity cyberpunk embeds.",
    images: [{ url: "/nova_v2.jpg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaFeeds | Ultimate Discord Feed & Alert Bot",
    description: "Real-time automated Discord feeds with high-fidelity embeds.",
    images: ["/nova_v2.jpg"],
  },
};

const FEATURES = [
  {
    icon: <Zap size={24} />,
    title: "Free Game Drops",
    desc: "Epic Games, Steam, and GOG free-to-keep promotions sent the minute they go live.",
  },
  {
    icon: <Play size={24} />,
    title: "YouTube & Twitch",
    desc: "Instant notifications for new video uploads, premieres, and live stream broadcasts.",
  },
  {
    icon: <Rss size={24} />,
    title: "Universal RSS Feeds",
    desc: "Track any news site, blog, podcast, or game patch notes with sub-minute accuracy.",
  },
  {
    icon: <Activity size={24} />,
    title: "Crypto & Markets",
    desc: "Real-time price threshold alerts and market movements directly in your channels.",
  },
  {
    icon: <Layout size={24} />,
    title: "Web Dashboard V2",
    desc: "Ultra-fast, responsive dashboard for total control over server alerts and roles.",
  },
  {
    icon: <Shield size={24} />,
    title: "Custom Branding",
    desc: "White-label feeds with custom bot avatar, server branding, and color palettes.",
  },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1489908793780338688'}&permissions=3387582172359760&response_type=code&redirect_uri=https%3A%2F%2Fnovafeeds.xyz%2Fapi%2Fauth%2Fcallback%2Fdiscord&integration_type=0&scope=identify+guilds+bot+applications.commands`;

  return (
    <PublicLayout session={session}>
      <AuthErrorNotification />

      <div className={["ui-container", styles["landing-container"]].join(" ")}>
        {/* ── 1. Hero Section ── */}
        <section className={styles["hero-section"]}>
          <div className={styles["hero-glow-orb"]} aria-hidden="true" />

          <div className={styles["hero-content"]}>
            <Badge variant="primary" size="md" dot icon={<Sparkles size={14} />}>
              NovaFeeds 2.0 • Ultra Fast Feeds
            </Badge>

            <Heading level={1} size="6xl" weight="black">
              Elevate your <br />
              <span className={styles["text-gradient"]}>server&apos;s feeds</span>
            </Heading>

            <Text
              as="p"
              size="lg"
              variant="secondary"
              className={styles["hero-lead"]}
            >
              The ultimate real-time Discord bot for Free Games, YouTube, Twitch,
              Kick, Steam, RSS, and Crypto — delivered with high-fidelity alerts.
            </Text>

            <div className={styles["hero-actions"]}>
              <a href={botInviteUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="primary" leftIcon={<Bot size={20} />}>
                  Add to Discord
                </Button>
              </a>

              {session ? (
                <Link href="/servers">
                  <Button
                    size="lg"
                    variant="secondary"
                    leftIcon={<Activity size={20} />}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/premium">
                  <Button
                    size="lg"
                    variant="secondary"
                    leftIcon={<Shield size={20} />}
                  >
                    View Premium Plans
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats Row */}
            <div className={styles["stats-bar"]}>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-icon"]}><Zap size={18} /></span>
                <span>Real-Time Delivery</span>
              </div>
              <div className={styles["stat-divider"]} aria-hidden="true" />
              <div className={styles["stat-item"]}>
                <span className={styles["stat-icon"]}><Globe size={18} /></span>
                <span>12+ Platform Feeds</span>
              </div>
              <div className={styles["stat-divider"]} aria-hidden="true" />
              <div className={styles["stat-item"]}>
                <span className={styles["stat-icon"]}><Layers size={18} /></span>
                <span>100% Customizable</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Live Ticker Bar ── */}
        <LiveTicker />

        {/* ── 3. Discord Showcase ── */}
        <section className={styles["showcase-section"]}>
          <div className={styles["showcase-card"]}>
            <div className={styles["showcase-info"]}>
              <Badge variant="primary" size="sm">
                STUNNING LAYOUTS
              </Badge>
              <Heading level={2} size="3xl" weight="bold">
                The most beautiful alerts in Discord.
              </Heading>
              <Text as="p" size="base" variant="secondary">
                Nova v2 introduces high-fidelity message layouts. With rich
                embeds, interactive action buttons, and smart media handling,
                your server updates look cleaner and more professional than ever.
              </Text>

              <div className={styles["showcase-badges"]}>
                <div className={styles["showcase-item"]}>
                  <div className={styles["showcase-icon-box"]}>
                    <Zap size={16} />
                  </div>
                  <span>Rich Media Video & Live Previews</span>
                </div>
                <div className={styles["showcase-item"]}>
                  <div className={styles["showcase-icon-box"]}>
                    <Layout size={16} />
                  </div>
                  <span>Smart Cyberpunk Embed V2 Styling</span>
                </div>
                <div className={styles["showcase-item"]}>
                  <div className={styles["showcase-icon-box"]}>
                    <Rocket size={16} />
                  </div>
                  <span>Interactive Quick-Action Discord Buttons</span>
                </div>
              </div>
            </div>

            <div className={styles["showcase-preview-wrapper"]}>
              <DiscordV2Preview />
            </div>
          </div>
        </section>

        {/* ── 4. Supported Platforms Carousel ── */}
        <PlatformCarousel />

        {/* ── 5. Features Grid ── */}
        <section>
          <div className={styles["section-header"]}>
            <Badge variant="neutral" size="sm">
              POWERFUL FEATURES
            </Badge>
            <Heading level={2} size="3xl" weight="bold">
              All the good stuff, none of the clutter
            </Heading>
            <Text as="p" size="base" variant="muted">
              Engineered for maximum reliability, speed, and customization.
            </Text>
          </div>

          <Grid columns={3} gap="lg">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} variant="elevated" className={styles["feature-card"]}>
                <CardHeader>
                  <div className={styles["feature-icon-wrapper"]}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text as="p" size="sm" variant="secondary">
                    {feature.desc}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </section>

        {/* ── 6. Final Call to Action ── */}
        <section>
          <div className={styles["cta-card"]}>
            <div className={styles["cta-glow"]} aria-hidden="true" />
            <Badge variant="primary" size="md">
              READY TO UPGRADE?
            </Badge>
            <Heading level={2} size="4xl" weight="black">
              Start delivering high-octane feeds today.
            </Heading>
            <Text
              as="p"
              size="base"
              variant="secondary"
              className={styles["cta-desc"]}
            >
              Join hundreds of Discord servers enjoying automated alerts, zero
              downtime, and customizable feeds.
            </Text>

            <Inline gap="md" wrap>
              <a href={botInviteUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="primary" leftIcon={<Bot size={20} />}>
                  Invite NovaFeeds Free
                </Button>
              </a>
              <Link href="/premium">
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Explore Premium
                </Button>
              </Link>
            </Inline>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
