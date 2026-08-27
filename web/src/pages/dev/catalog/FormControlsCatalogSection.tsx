/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import {
  Card,
  Stack,
  Grid,
  Inline,
  Text,
  Field,
  Input,
  Select,
  Textarea,
  Switch,
  Checkbox,
  Radio,
  Divider,
} from '@/ui';

export const FormControlsCatalogSection: React.FC = () => {
  const [switchChecked, setSwitchChecked] = useState<boolean>(true);
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(true);
  const [radioSelected, setRadioSelected] = useState<string>('opt1');

  return (
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
              <Inline gap="md" align="center">
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
  );
};
