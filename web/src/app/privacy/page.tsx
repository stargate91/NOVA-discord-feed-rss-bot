import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  Heading,
  Text,
  Badge,
  Divider,
  Button,
} from "@/components/ui";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | NovaFeeds",
  description: "Privacy Policy and data protection overview for NovaFeeds Discord Bot.",
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <PublicLayout>
      <div className={["ui-container", styles["policy-container"]].join(" ")}>
        <Link href="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
            Back to Home
          </Button>
        </Link>

        <Card variant="elevated">
          <CardContent>
            <div className={styles["policy-header"]}>
              <Badge variant="success" size="sm" icon={<ShieldCheck size={12} />}>
                DATA PROTECTION
              </Badge>
              <Heading level={1} size="3xl" weight="bold">
                Privacy Policy
              </Heading>
              <Text as="p" size="xs" variant="muted">
                Last Updated: {lastUpdated}
              </Text>
            </div>

            <Divider />

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                1. Information We Collect
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                When you use NovaFeeds and our dashboard, we collect the minimum
                amount of data necessary to provide our services. This includes:
              </Text>
              <ul className={styles["policy-list"]}>
                <li>
                  <Text as="span" weight="semibold" variant="primary">
                    Discord Profile Data:{" "}
                  </Text>
                  Your Discord ID, username, and avatar URL when you log in.
                </li>
                <li>
                  <Text as="span" weight="semibold" variant="primary">
                    Server Data:{" "}
                  </Text>
                  IDs and names of servers where the bot is invited, and channel
                  IDs you configure for feeds.
                </li>
                <li>
                  <Text as="span" weight="semibold" variant="primary">
                    Feed Configurations:{" "}
                  </Text>
                  URLs and settings for the feeds you choose to monitor.
                </li>
              </ul>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                2. How We Use Your Data
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                We use the collected information solely for the operation and
                improvement of NovaFeeds. This includes:
              </Text>
              <ul className={styles["policy-list"]}>
                <li>
                  Delivering automated messages to your configured Discord
                  channels.
                </li>
                <li>Authenticating your access to the web dashboard.</li>
                <li>
                  Managing your premium subscriptions via our payment provider
                  (Stripe).
                </li>
              </ul>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                3. Data Sharing and Third Parties
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                We do not sell, trade, or otherwise transfer your personal
                information to outside parties. Your data may be shared with
                trusted third parties who assist us in operating our services
                (e.g., Stripe for payments), provided they agree to keep this
                information confidential.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                4. Data Retention and Deletion
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                Your data is stored securely in our database. If you remove
                NovaFeeds from your server, your server&apos;s feed
                configurations will become inactive. You may request the complete
                deletion of your data by contacting us on our Support Server.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                5. Cookies
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                Our web dashboard uses session cookies (via NextAuth) strictly
                for authentication purposes to keep you logged in. We do not use
                tracking or advertising cookies.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                6. Contact Us
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                If you have any questions regarding this Privacy Policy, please
                contact us on our{" "}
                <a
                  href="https://discord.gg/PbvX3S7pXR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["policy-link"]}
                >
                  Support Server
                </a>
                .
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
