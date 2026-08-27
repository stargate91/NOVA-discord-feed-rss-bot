import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, Tag, Chip, ProgressBar, Skeleton, DiscordEmbed, Card, Alert } from '@/ui';

describe('Data Display & Visual Feedback Components UI Tests', () => {
  it('should render Badge with dot, pulse, and count overflow formatting', () => {
    render(<Badge count={150} overflowCount={99} variant="danger" />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should render Tag with custom label and variant', () => {
    render(<Tag variant="filled" color="blue" label="v2.4.0 Release" />);
    expect(screen.getByText('v2.4.0 Release')).toBeInTheDocument();
  });

  it('should render Chip with interactive state', () => {
    render(<Chip label="YouTube Monitor" active />);
    expect(screen.getByText('YouTube Monitor')).toBeInTheDocument();
  });

  it('should render ProgressBar with value percentage and accessible ARIA attributes', () => {
    render(<ProgressBar value={75} max={100} label="Queue Capacity" showValue />);
    const progressEl = screen.getByRole('progressbar');
    expect(progressEl).toBeInTheDocument();
    expect(progressEl).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render Skeleton placeholder with proper aria-hidden attribute', () => {
    render(<Skeleton height="card" width="full" />);
    const skeletonEl = document.querySelector('[aria-hidden="true"]');
    expect(skeletonEl).toBeInTheDocument();
  });

  it('should render Alert with title and description', () => {
    render(
      <Alert
        variant="warning"
        title="Rate Limit Approaching"
        description="Your Discord server is near the 200 monitors limit."
      />
    );
    expect(screen.getByText('Rate Limit Approaching')).toBeInTheDocument();
    expect(
      screen.getByText('Your Discord server is near the 200 monitors limit.')
    ).toBeInTheDocument();
  });

  it('should render Card with header, title, and body content', () => {
    render(
      <Card title="Server Overview" subtitle="Real-time bot metrics">
        <p>Active feeds: 14</p>
      </Card>
    );
    expect(screen.getByText('Server Overview')).toBeInTheDocument();
    expect(screen.getByText('Real-time bot metrics')).toBeInTheDocument();
    expect(screen.getByText('Active feeds: 14')).toBeInTheDocument();
  });

  it('should render DiscordEmbed with author, title, description, and fields', () => {
    render(
      <DiscordEmbed
        channelName="youtube-announcements"
        botName="Nova Feeds"
        title="🚀 New Video Live!"
        description="MrBeast just uploaded a new challenge video."
        fields={[
          { name: 'Duration', value: '15:20', inline: true },
          { name: 'Quality', value: '4K 60FPS', inline: true },
        ]}
      />
    );
    expect(screen.getByText('youtube-announcements')).toBeInTheDocument();
    expect(screen.getByText('Nova Feeds')).toBeInTheDocument();
    expect(screen.getByText('🚀 New Video Live!')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('15:20')).toBeInTheDocument();
  });
});
