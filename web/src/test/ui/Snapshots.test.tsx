import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Card, Badge, Alert } from '@/ui';

describe('UI Primitives DOM Snapshot Regression Tests', () => {
  it('should match Button snapshot across variants', () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="gradient">Gradient</Button>
      </div>
    );

    expect(container).toMatchSnapshot();
  });

  it('should match Card snapshot with header, body, and actions', () => {
    const { container } = render(
      <Card padding="lg" glow="blue">
        <Card.Header>
          <Card.Title>Server Overview</Card.Title>
          <Card.Description>Manage your automated notification feeds</Card.Description>
        </Card.Header>
        <Card.Body>Active monitors: 5</Card.Body>
        <Card.Footer>
          <Button variant="primary">Configure</Button>
        </Card.Footer>
      </Card>
    );

    expect(container).toMatchSnapshot();
  });

  it('should match Badge and Alert snapshots', () => {
    const { container } = render(
      <div>
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Warning</Badge>
        <Alert variant="info" title="Information">
          Feed sync completed.
        </Alert>
      </div>
    );

    expect(container).toMatchSnapshot();
  });
});
