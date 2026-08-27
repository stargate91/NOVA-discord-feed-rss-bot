import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Input,
  Textarea,
  Field,
  Select,
  Switch,
  Checkbox,
  Radio,
  SegmentedControl,
} from '@/ui';

describe('Form Controls & Inputs UI Tests', () => {
  it('should render Input and accept user typing with clear button support', async () => {
    const user = userEvent.setup();
    const ControlledInput = () => {
      const [val, setVal] = useState('');
      return (
        <Input
          placeholder="Enter feed title..."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          clearable
          onClear={() => setVal('')}
        />
      );
    };

    render(<ControlledInput />);
    const inputEl = screen.getByPlaceholderText('Enter feed title...');
    expect(inputEl).toBeInTheDocument();

    await user.type(inputEl, 'YouTube Tech Updates');
    expect(inputEl).toHaveValue('YouTube Tech Updates');

    const clearBtn = screen.getByLabelText('Clear input');
    await user.click(clearBtn);
    expect(inputEl).toHaveValue('');
  });

  it('should render Textarea and handle multiline input', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Custom embed template..." rows={4} />);

    const textareaEl = screen.getByPlaceholderText('Custom embed template...');
    expect(textareaEl).toBeInTheDocument();

    await user.type(textareaEl, 'Hello world\nSecond line');
    expect(textareaEl).toHaveValue('Hello world\nSecond line');
  });

  it('should render Field with label, description, and required indicator', () => {
    render(
      <Field
        label="Webhook URL"
        description="Discord channel webhook destination."
        required
      >
        <Input placeholder="https://discord.com/api/webhooks/..." />
      </Field>
    );

    expect(screen.getByText('Webhook URL')).toBeInTheDocument();
    expect(screen.getByText('Discord channel webhook destination.')).toBeInTheDocument();
  });

  it('should render Field in error state with alert message', () => {
    render(
      <Field
        label="Webhook URL"
        error="Invalid webhook format"
      >
        <Input placeholder="https://discord.com/api/webhooks/..." />
      </Field>
    );

    expect(screen.getByText('Webhook URL')).toBeInTheDocument();
    expect(screen.getByText('Invalid webhook format')).toBeInTheDocument();
  });

  it('should render Switch toggle and respond to user clicks', async () => {
    const user = userEvent.setup();
    const SwitchWrapper = () => {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          checked={checked}
          onChange={setChecked}
          label="Sub-second Polling"
          description="Check feeds every 500ms"
        />
      );
    };

    render(<SwitchWrapper />);
    const switchEl = screen.getByRole('switch', { name: /Sub-second Polling/i });
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute('aria-checked', 'false');

    await user.click(switchEl);
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('should render Checkbox and toggle checked state', async () => {
    const user = userEvent.setup();
    const CheckboxWrapper = () => {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          label="Include Rich Media Thumbnails"
        />
      );
    };

    render(<CheckboxWrapper />);
    const checkboxEl = screen.getByRole('checkbox', { name: 'Include Rich Media Thumbnails' });
    expect(checkboxEl).toBeInTheDocument();
    expect(checkboxEl).not.toBeChecked();

    await user.click(checkboxEl);
    expect(checkboxEl).toBeChecked();
  });

  it('should render Radio button and select option', async () => {
    const user = userEvent.setup();
    const RadioGroupWrapper = () => {
      const [selected, setSelected] = useState('free');
      return (
        <div>
          <Radio
            name="tier"
            value="free"
            checked={selected === 'free'}
            onChange={() => setSelected('free')}
            label="Free Tier"
          />
          <Radio
            name="tier"
            value="pro"
            checked={selected === 'pro'}
            onChange={() => setSelected('pro')}
            label="Professional Tier"
          />
        </div>
      );
    };

    render(<RadioGroupWrapper />);
    const proRadio = screen.getByRole('radio', { name: 'Professional Tier' });
    expect(proRadio).not.toBeChecked();

    await user.click(proRadio);
    expect(proRadio).toBeChecked();
  });

  it('should render Select dropdown with options and trigger selection', async () => {
    const user = userEvent.setup();
    const SelectWrapper = () => {
      const [val, setVal] = useState('');
      return (
        <Select
          label="Feed Provider"
          value={val}
          onValueChange={setVal}
          options={[
            { label: 'YouTube', value: 'youtube' },
            { label: 'Twitch', value: 'twitch' },
            { label: 'Kick', value: 'kick' },
          ]}
        />
      );
    };

    render(<SelectWrapper />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    const twitchOption = screen.getByRole('option', { name: /Twitch/i });
    await user.click(twitchOption);

    expect(screen.getByText('Twitch')).toBeInTheDocument();
  });

  it('should render SegmentedControl and switch active tabs', async () => {
    const user = userEvent.setup();
    const SegWrapper = () => {
      const [active, setActive] = useState('all');
      return (
        <SegmentedControl
          value={active}
          onChange={setActive}
          options={[
            { label: 'All Feeds', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
          ]}
        />
      );
    };

    render(<SegWrapper />);
    const pausedTab = screen.getByRole('tab', { name: 'Paused' });
    await user.click(pausedTab);
    expect(pausedTab).toHaveAttribute('aria-selected', 'true');
  });
});
