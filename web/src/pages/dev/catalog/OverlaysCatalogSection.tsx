/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import {
  Card,
  Stack,
  Grid,
  Inline,
  Text,
  Alert,
  Button,
  Spinner,
  Modal,
  Drawer,
  Divider,
} from '@/ui';

export const OverlaysCatalogSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  return (
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
                This is an accessible compound Modal primitive using React Portal, focus trap, and
                escape key listener.
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
              <Text size="sm">Side drawer navigation and secondary action container.</Text>
              <Button variant="outline" fullWidth onClick={() => setDrawerOpen(false)}>
                Close Drawer
              </Button>
            </Stack>
          </Drawer>
        </Stack>
      </Card>
    </Stack>
  );
};
