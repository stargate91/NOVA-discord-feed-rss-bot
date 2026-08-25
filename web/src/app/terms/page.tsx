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
import { formatPolicyDate } from "@/utils";
import { TERMS_SECTIONS } from "@/constants/terms";
import styles from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | NovaFeeds",
  description: "Terms of Service and usage guidelines for NovaFeeds Discord Bot.",
};

export default function TermsPage() {
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

            {TERMS_SECTIONS.map((section) => (
              <div key={section.id} className={styles["policy-section"]}>
                <Heading level={2} size="lg" weight="semibold">
                  {section.title}
                </Heading>
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
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
