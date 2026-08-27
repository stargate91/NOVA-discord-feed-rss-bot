/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { Layers, Search } from 'lucide-react';
import { Container, Stack, Inline, Text, Badge, Input, SegmentedControl } from '@/ui';
import { SEO } from '@/components/common/SEO';
import {
  ButtonsCatalogSection,
  FormControlsCatalogSection,
  OverlaysCatalogSection,
  FeedbackCatalogSection,
  LayoutCatalogSection,
} from './catalog';
import styles from './UiCatalogPage.module.css';

type CatalogCategory = 'actions' | 'forms' | 'feedback' | 'display' | 'layout';

const CATEGORIES: { id: CatalogCategory; label: string; count: number }[] = [
  { id: 'actions', label: 'Actions & Buttons', count: 4 },
  { id: 'forms', label: 'Form Controls', count: 9 },
  { id: 'feedback', label: 'Feedback & Overlays', count: 8 },
  { id: 'display', label: 'Data Display', count: 11 },
  { id: 'layout', label: 'Layout & Typography', count: 6 },
];

export const UiCatalogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>('actions');
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <Container maxWidth="xl" padding="lg">
      <SEO title="UI Component Catalog & Design System" noIndex />

      {/* Header */}
      <Stack gap="lg" className={styles.headerStack}>
        <Inline justify="between" align="center" wrap>
          <div>
            <Inline align="center" gap="sm">
              <Layers size={28} color="var(--brand-primary)" />
              <Text as="h1" size="2xl" weight="bold">
                UI Design System Catalog
              </Text>
              <Badge variant="info">38 Components</Badge>
            </Inline>
            <Text color="secondary" size="sm" className={styles.subtitle}>
              Interactive showcase and design system reference for all Nova atomic & compound
              components.
            </Text>
          </div>

          <Inline gap="sm">
            <div className={styles.searchInput}>
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
          </Inline>
        </Inline>

        {/* Category Navigation */}
        <SegmentedControl
          value={activeCategory}
          onChange={(val) => setActiveCategory(val as CatalogCategory)}
          options={CATEGORIES.map((c) => ({
            value: c.id,
            label: `${c.label} (${c.count})`,
          }))}
        />
      </Stack>

      {/* Modular Category Sections */}
      {activeCategory === 'actions' && <ButtonsCatalogSection />}
      {activeCategory === 'forms' && <FormControlsCatalogSection />}
      {activeCategory === 'feedback' && <OverlaysCatalogSection />}
      {activeCategory === 'display' && <FeedbackCatalogSection />}
      {activeCategory === 'layout' && <LayoutCatalogSection />}
    </Container>
  );
};
