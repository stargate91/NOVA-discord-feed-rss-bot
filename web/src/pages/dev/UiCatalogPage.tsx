/* eslint-disable i18next/no-literal-string, react/forbid-component-props */
import React, { useState } from 'react';
import {
  Layers,
  Search,
  Bell,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';
import {
  Container,
  Card,
  Button,
  IconButton,
  Badge,
  Chip,
  Tag,
  Accordion,
  Input,
  Field,
  Select,
  Textarea,
  Switch,
  Checkbox,
  Radio,
  SegmentedControl,
  ProgressBar,
  Spinner,
  Skeleton,
  Grid,
  Stack,
  Inline,
  Divider,
  Text,
  Alert,
  DiscordEmbed,
  Breadcrumbs,
  Pagination,
  Modal,
  Drawer,
} from '@/ui';
import { SEO } from '@/components/common/SEO';

type CatalogCategory = 'actions' | 'forms' | 'feedback' | 'display' | 'layout';

export const UiCatalogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>('actions');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Interactive playground states
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [btnSize, setBtnSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('md');
  const [switchChecked, setSwitchChecked] = useState<boolean>(true);
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(true);
  const [radioSelected, setRadioSelected] = useState<string>('opt1');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories: { id: CatalogCategory; label: string; count: number }[] = [
    { id: 'actions', label: 'Actions & Buttons', count: 4 },
    { id: 'forms', label: 'Form Controls', count: 9 },
    { id: 'feedback', label: 'Feedback & Overlays', count: 8 },
    { id: 'display', label: 'Data Display', count: 11 },
    { id: 'layout', label: 'Layout & Typography', count: 6 },
  ];

  return (
    <Container maxWidth="xl" padding="lg">
      <SEO title="UI Component Catalog & Design System" noIndex />

      {/* Header */}
      <Stack gap="lg" style={{ marginBottom: '2rem' }}>
        <Inline justify="between" align="center" wrap>
          <div>
            <Inline align="center" gap="sm">
              <Layers size={28} color="var(--brand-primary)" />
              <Text as="h1" size="2xl" weight="bold">
                UI Design System Catalog
              </Text>
              <Badge variant="info">38 Components</Badge>
            </Inline>
            <Text color="secondary" size="sm" style={{ marginTop: '0.25rem' }}>
              Interactive showcase and design system reference for all Nova atomic & compound components.
            </Text>
          </div>

          <Inline gap="sm">
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{ width: 240 }}
            />
          </Inline>
        </Inline>

        {/* Category Navigation */}
        <SegmentedControl
          value={activeCategory}
          onChange={(val) => setActiveCategory(val as CatalogCategory)}
          options={categories.map((c) => ({
            value: c.id,
            label: `${c.label} (${c.count})`,
          }))}
        />
      </Stack>

      {/* Content based on Active Category */}
      {activeCategory === 'actions' && (
        <Stack gap="xl">
          {/* Button Showcase */}
          <Card padding="lg" glow="blue">
            <Stack gap="md">
              <Inline justify="between" align="center">
                <div>
                  <Text as="h2" size="lg" weight="bold">
                    Button Component (Polymorphic Generic)
                  </Text>
                  <Text size="xs" color="secondary">
                    Supports 13 visual variants, 4 sizes, loading spinner, icons, and polymorphic generic `as` prop.
                  </Text>
                </div>
                <Inline gap="xs">
                  <Button
                    size="xs"
                    variant={btnLoading ? 'primary' : 'outline'}
                    onClick={() => setBtnLoading(!btnLoading)}
                  >
                    Toggle Loading
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      const sizes: ('xs' | 'sm' | 'md' | 'lg')[] = ['xs', 'sm', 'md', 'lg'];
                      const next = sizes[(sizes.indexOf(btnSize) + 1) % sizes.length];
                      setBtnSize(next);
                    }}
                  >
                    Size: {btnSize.toUpperCase()}
                  </Button>
                </Inline>
              </Inline>

              <Divider />

              <Text size="xs" weight="bold" color="secondary">
                COLOR VARIANTS MATRIX
              </Text>
              <Inline gap="sm" wrap>
                <Button variant="primary" size={btnSize} loading={btnLoading}>
                  Primary
                </Button>
                <Button variant="secondary" size={btnSize} loading={btnLoading}>
                  Secondary
                </Button>
                <Button variant="discord" size={btnSize} loading={btnLoading} icon={<Bot size={16} />}>
                  Discord
                </Button>
                <Button variant="gradient" size={btnSize} loading={btnLoading} icon={<Zap size={16} />}>
                  Gradient
                </Button>
                <Button variant="success" size={btnSize} loading={btnLoading}>
                  Success
                </Button>
                <Button variant="danger" size={btnSize} loading={btnLoading}>
                  Danger
                </Button>
                <Button variant="outline" size={btnSize} loading={btnLoading}>
                  Outline
                </Button>
                <Button variant="glass" size={btnSize} loading={btnLoading}>
                  Glass
                </Button>
                <Button variant="ghost" size={btnSize} loading={btnLoading}>
                  Ghost
                </Button>
                <Button variant="soft" size={btnSize} loading={btnLoading}>
                  Soft
                </Button>
                <Button variant="danger-outline" size={btnSize} loading={btnLoading}>
                  Danger Outline
                </Button>
              </Inline>

              <Text size="xs" weight="bold" color="secondary" style={{ marginTop: '0.5rem' }}>
                POLYMORPHIC AS ANCHOR LINK (Type-Safe Generic)
              </Text>
              <Inline gap="sm">
                <Button
                  as="a"
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink size={14} />}
                >
                  External Anchor Link
                </Button>
                <IconButton
                  icon={<Bell size={18} />}
                  aria-label="Notifications"
                  variant="secondary"
                  size={btnSize}
                />
              </Inline>
            </Stack>
          </Card>
        </Stack>
      )}

      {activeCategory === 'forms' && (
        <Stack gap="xl">
          <Card padding="lg">
            <Stack gap="md">
              <Text as="h2" size="lg" weight="bold">
                Form Inputs & Selection Controls
              </Text>
              <Text size="xs" color="secondary">
                Fully controlled accessible form components with label, hint, and error states.
              </Text>
              <Divider />

              <Grid columns={2} gap="lg">
                <Field label="Server Name" hint="Displayed in Discord bot embeds" required>
                  <Input placeholder="Stargate Lounge" defaultValue="Nova VIP Feed" />
                </Field>

                <Field label="Alert Channel" hint="Target webhook destination">
                  <Select
                    options={[
                      { value: 'announcements', label: '#announcements' },
                      { value: 'feeds', label: '#live-feeds' },
                      { value: 'general', label: '#general' },
                    ]}
                    defaultValue="feeds"
                  />
                </Field>

                <Field label="Custom Prompt Template">
                  <Textarea placeholder="Format your feed delivery markdown..." rows={3} />
                </Field>

                <Stack gap="sm">
                  <Text size="xs" weight="bold" color="secondary">
                    TOGGLES & SELECTION CONTROLS
                  </Text>
                  <Inline gap="md" align="center">
                    <Switch
                      checked={switchChecked}
                      onChange={(checked) => setSwitchChecked(checked)}
                      label="Auto-Sync Webhooks"
                    />
                    <Checkbox
                      checked={checkboxChecked}
                      onChange={(e) => setCheckboxChecked(e.target.checked)}
                      label="Rich Embeds"
                    />
                  </Inline>
                  <Inline gap="md" align="center" style={{ marginTop: '0.5rem' }}>
                    <Radio
                      name="opt"
                      value="opt1"
                      checked={radioSelected === 'opt1'}
                      onChange={() => setRadioSelected('opt1')}
                      label="Real-time (0s)"
                    />
                    <Radio
                      name="opt"
                      value="opt2"
                      checked={radioSelected === 'opt2'}
                      onChange={() => setRadioSelected('opt2')}
                      label="Batched (5m)"
                    />
                  </Inline>
                </Stack>
              </Grid>
            </Stack>
          </Card>
        </Stack>
      )}

      {activeCategory === 'feedback' && (
        <Stack gap="xl">
          <Card padding="lg">
            <Stack gap="md">
              <Text as="h2" size="lg" weight="bold">
                Feedback, Alerts & Overlays
              </Text>
              <Divider />

              <Grid columns={2} gap="md">
                <Alert variant="info" title="System Notice">
                  Automatic failover routing is currently active across 3 European regions.
                </Alert>
                <Alert variant="success" title="Backup Complete">
                  Feed configurations were securely synchronized to cloud storage.
                </Alert>
                <Alert variant="warning" title="Rate Limit Threshold">
                  YouTube API quota usage reached 82% of daily allocation.
                </Alert>
                <Alert variant="danger" title="Webhook Connection Failed">
                  Target Discord channel #announcements returned 404 Unknown Channel.
                </Alert>
              </Grid>

              <Divider />

              <Inline gap="md" align="center">
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                  Open Modal Demo
                </Button>
                <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                  Open Drawer Demo
                </Button>
                <Inline gap="xs" align="center">
                  <Spinner size="sm" />
                  <Text size="xs" color="secondary">
                    Spinner (SM)
                  </Text>
                </Inline>
              </Inline>

              <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Modal.Header>
                  <Modal.Title>Modal Dialog Showcase</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Text size="sm">
                    This is an accessible compound Modal primitive using React Portal, focus trap, and escape key listener.
                  </Text>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>
                    Confirm
                  </Button>
                </Modal.Footer>
              </Modal>

              <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer Overlay">
                <Stack gap="md">
                  <Text size="sm">
                    Side drawer navigation and secondary action container.
                  </Text>
                  <Button variant="outline" fullWidth onClick={() => setDrawerOpen(false)}>
                    Close Drawer
                  </Button>
                </Stack>
              </Drawer>
            </Stack>
          </Card>
        </Stack>
      )}

      {activeCategory === 'display' && (
        <Stack gap="xl">
          <Card padding="lg">
            <Stack gap="md">
              <Text as="h2" size="lg" weight="bold">
                Badges, Chips, Tags & Discord Previews
              </Text>
              <Divider />

              <Text size="xs" weight="bold" color="secondary">
                BADGES & CHIPS
              </Text>
              <Inline gap="xs" wrap>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="danger">Error</Badge>
                <Badge variant="purple">Pro Tier</Badge>
                <Chip label="YouTube RSS" variant="filled" active />
                <Chip label="Twitch Live" variant="outline" />
                <Chip label="Kick VOD" variant="subtle" />
                <Tag variant="default" color="blue">#discord-feeds</Tag>
              </Inline>

              <Text size="xs" weight="bold" color="secondary" style={{ marginTop: '0.75rem' }}>
                PROGRESS & SKELETON LOADERS
              </Text>
              <ProgressBar value={72} max={100} variant="brand" label="Database Cache Load" />
              <Inline gap="md" align="center">
                <Skeleton variant="circular" width="quarter" height="md" />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Skeleton width="two-thirds" height="xs" />
                  <Skeleton width="half" height="xs" />
                </Stack>
              </Inline>

              <Text size="xs" weight="bold" color="secondary" style={{ marginTop: '0.75rem' }}>
                DISCORD EMBED PREVIEW
              </Text>
              <DiscordEmbed
                author={{ name: 'Nova Feeds Bot', icon_url: '/images/logo.webp' }}
                title="🚀 Version 2.4 Released with Webhook Automation"
                description="Instant multi-platform notifications with zero latency delivery and customizable rich embed layouts."
                color="#5865F2"
                timestamp="Today at 15:20"
                footer={{ text: 'Nova Delivery Network • EU-Central' }}
              />
            </Stack>
          </Card>
        </Stack>
      )}

      {activeCategory === 'layout' && (
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
                    Nova continuously monitors bot latency across 4 continents and automatically routes traffic through healthy nodes.
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="acc2">
                  <Accordion.Trigger>Are custom CSS design tokens supported?</Accordion.Trigger>
                  <Accordion.Content>
                    All 38 components utilize CSS custom properties defined in theme-tokens.css supporting dark and light themes seamlessly.
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </Stack>
          </Card>
        </Stack>
      )}
    </Container>
  );
};
