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
import { formatPolicyDate } from "@/utils";
import { PRIVACY_SECTIONS } from "@/constants/privacy";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | NovaFeeds",
  description: "Privacy Policy and data protection overview for NovaFeeds Discord Bot.",
};

export default function PrivacyPage() {
  const lastUpdated = formatPolicyDate();

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

            {PRIVACY_SECTIONS.map((section) => (
              <div key={section.id} className={styles["policy-section"]}>
                <Heading level={2} size="lg" weight="semibold">
                  {section.title}
                </Heading>

                {section.description && (
                  <Text as="p" size="sm" variant="secondary">
                    {section.description}
                  </Text>
                )}

                {section.list && (
                  <ul className={styles["policy-list"]}>
                    {section.list.map((item, idx) => (
                      <li key={idx}>
                        {item.prefix && (
                          <Text as="span" weight="semibold" variant="primary">
                            {item.prefix}
                          </Text>
                        )}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                )}

                {section.content && (
                  <Text as="p" size="sm" variant="secondary">
                    {section.content}
                    {section.link && (
                      <a
                        href={section.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles["policy-link"]}
                      >
                        {section.link.text}
                      </a>
                    )}
                    {section.link ? "." : ""}
                  </Text>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
