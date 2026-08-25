import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
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
import styles from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | NovaFeeds",
  description: "Terms of Service and usage guidelines for NovaFeeds Discord Bot.",
};

export default function TermsPage() {
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
              <Badge variant="primary" size="sm" icon={<FileText size={12} />}>
                LEGAL AGREEMENT
              </Badge>
              <Heading level={1} size="3xl" weight="bold">
                Terms of Service
              </Heading>
              <Text as="p" size="xs" variant="muted">
                Last Updated: {lastUpdated}
              </Text>
            </div>

            <Divider />

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                1. Acceptance of Terms
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                By inviting NovaFeeds to your Discord server or logging into our web
                dashboard, you agree to comply with and be bound by these Terms of
                Service. If you do not agree to these terms, please do not use the
                bot.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                2. Description of Service
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                NovaFeeds is a Discord bot that provides automated feed
                notifications (including Free Games, YouTube, Twitch, RSS, and
                Crypto updates) to Discord servers. We provide a web dashboard to
                configure these feeds.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                3. User Responsibilities
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                You are responsible for the feeds you configure NovaFeeds to
                monitor. You agree not to use NovaFeeds to distribute illegal,
                offensive, or malicious content. We reserve the right to remove
                the bot from your server or ban your account if you violate
                Discord&apos;s Terms of Service or our guidelines.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                4. Premium Subscriptions
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                NovaFeeds offers premium features through a subscription model.
                Payments are securely processed via Stripe. Subscriptions
                automatically renew unless canceled. You may cancel your
                subscription at any time through the dashboard. Refunds are subject
                to our refund policy and handled on a case-by-case basis.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                5. Limitation of Liability
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                NovaFeeds is provided &quot;as is&quot; without any warranties. We do
                not guarantee 100% uptime or the complete accuracy of feed
                deliveries. In no event shall NovaFeeds or its developers be
                liable for any damages arising out of the use or inability to use
                the service.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                6. Changes to Terms
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                We reserve the right to modify these Terms of Service at any time.
                Continued use of NovaFeeds after any such changes constitutes your
                consent to such changes.
              </Text>
            </div>

            <div className={styles["policy-section"]}>
              <Heading level={2} size="lg" weight="semibold">
                7. Contact Us
              </Heading>
              <Text as="p" size="sm" variant="secondary">
                If you have any questions about these Terms, please reach out to us
                on our{" "}
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
