/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { Card, Stack, Text, Breadcrumbs, Pagination, Accordion, Divider } from '@/ui';

export const LayoutCatalogSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  return (
    <Stack gap="xl">
      <Card padding="lg">
        <Stack gap="md">
          <Text as="h2" size="lg" weight="bold">
            Layout Primitives & Navigation
          </Text>
          <Divider />

          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Developer Portal', href: '/dev' },
              { label: 'UI Catalog' },
            ]}
          />

          <Pagination
            page={currentPage}
            totalPages={10}
            onPageChange={(p) => setCurrentPage(p)}
          />

          <Accordion type="single">
            <Accordion.Item value="acc1">
              <Accordion.Trigger>How does Nova handle multi-region failover?</Accordion.Trigger>
              <Accordion.Content>
                Nova continuously monitors bot latency across 4 continents and automatically
                routes traffic through healthy nodes.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="acc2">
              <Accordion.Trigger>Are custom CSS design tokens supported?</Accordion.Trigger>
              <Accordion.Content>
                All 38 components utilize CSS custom properties defined in theme-tokens.css
                supporting dark and light themes seamlessly.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Card>
    </Stack>
  );
};
