import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/ui';

describe('Polymorphic Button Component', () => {
  it('should render as a native button element by default', () => {
    render(<Button variant="primary">Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click Me' });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement.tagName).toBe('BUTTON');
  });

  it('should render as an anchor link when as="a"', () => {
    render(
      <Button
        as="a"
        href="https://discord.com"
        target="_blank"
        rel="noopener noreferrer"
        variant="discord"
      >
        Discord Link
      </Button>
    );

    const linkElement = screen.getByRole('link', { name: 'Discord Link' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', 'https://discord.com');
    expect(linkElement).toHaveAttribute('target', '_blank');
  });

  it('should support loading spinner and disabled states', () => {
    render(
      <Button loading loadingText="Saving...">
        Save
      </Button>
    );

    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveTextContent('Saving...');
  });
});
