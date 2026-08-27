# Nova UI Design System & Component Composition Guidelines

Welcome to the Nova Design System specification. This document serves as the official architecture guide and component composition standard for the Nova platform web application.

---

## 1. Design Token Architecture

All UI components in `@/ui` are built on top of the centralized CSS custom property token system defined in [`src/styles/variables.css`](file:///e:/projects/repos/bots/nova/web/src/styles/variables.css).

### Token Hierarchy
1. **Color Tokens:**
   - **Primary Palette:** `--color-blue-50` through `--color-blue-900`
   - **Neutral Palette:** `--color-slate-50` through `--color-slate-900`
   - **Semantic Colors:** `--status-success`, `--status-warning`, `--status-danger`, `--status-info`
   - **Glassmorphism / Glow:** `--glass-bg`, `--glass-border`, `--glow-blue`, `--glow-cyan`
2. **Typography Scale:**
   - Sizes: `--font-2xs` (10px) to `--font-6xl` (60px)
   - Font Family: `Outfit` (Headings) / `Inter` (Body & Code)
3. **Spacing & Elevation:**
   - Spacing: `--space-2xs` (2px) to `--space-5xl` (96px)
   - Radius: `--radius-xs` (2px) to `--radius-full` (9999px)
   - Shadows: `--shadow-xs` to `--shadow-2xl`

---

## 2. Component Composition Patterns

### 2.1 Compound Component Pattern
Complex components with multiple slots use the Compound Component pattern, providing clean JSX hierarchies and internal React Context synchronization.

#### Example: Modal
```tsx
import { Modal, Button } from '@/ui';

export const MyConfirmModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal open={isOpen} onClose={onClose} size="md">
    <Modal.Header>
      <Modal.Title>Delete Monitor</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Are you sure you want to delete this YouTube monitor? This action cannot be undone.
    </Modal.Body>
    <Modal.Footer>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>Delete</Button>
    </Modal.Footer>
  </Modal>
);
```

#### Example: Tabs
```tsx
import { Tabs } from '@/ui';

export const SettingsTabs = () => (
  <Tabs defaultValue="general" variant="pill">
    <Tabs.List>
      <Tabs.Tab value="general">General</Tabs.Tab>
      <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
      <Tabs.Tab value="security">Security</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="general">General Settings Content</Tabs.Panel>
    <Tabs.Panel value="notifications">Notification Preferences</Tabs.Panel>
    <Tabs.Panel value="security">Security & OAuth Keys</Tabs.Panel>
  </Tabs>
);
```

---

## 3. Polymorphic Components

Components that can render as different HTML elements (e.g. `Button` rendering as `<button>`, `<a>`, or React Router `<Link>`) support the polymorphic `as` prop.

```tsx
import { Button } from '@/ui';
import { Link } from 'react-router-dom';

// Native button
<Button variant="primary" onClick={handleClick}>Submit</Button>

// Polymorphic Link
<Button as={Link} to="/premium" variant="gradient">Upgrade to Pro</Button>

// External Anchor
<Button as="a" href="https://discord.gg/tjRStPtm9k" target="_blank" variant="discord">
  Join Discord
</Button>
```

---

## 4. Form Controls & Field Wrapping

Form inputs (`Input`, `Select`, `Textarea`, `Switch`, `Radio`, `Checkbox`) should always be wrapped with the `<Field>` component for consistent labels, descriptions, and error validation messages.

```tsx
import { Field, Input } from '@/ui';

<Field
  label="Webhook URL"
  description="The Discord channel webhook URL where feeds will be broadcast."
  error={formErrors.webhookUrl}
  required
>
  <Input
    value={webhookUrl}
    onChange={(e) => setWebhookUrl(e.target.value)}
    placeholder="https://discord.com/api/webhooks/..."
  />
</Field>
```

---

## 5. Layout Primitives

Always construct UI layouts using layout primitives rather than custom margin/padding rules:
- **`<Container>`**: Max-width boundaries and responsive horizontal gutters.
- **`<Stack>`**: Vertical flex layout with configurable `gap`, `align`, and `justify`.
- **`<Inline>`**: Horizontal flex layout with wrapping and item alignment.
- **`<Grid>`**: CSS Grid container with responsive column breakpoints (`cols={1}`, `md={2}`, `lg={3}`).
- **`<Divider>`**: Visual horizontal or vertical separator with optional text label.

---

## 6. Accessibility & Keyboard Navigation (a11y)

- **Focus Trap:** Overlays (`Modal`, `Drawer`) automatically trap focus using `useFocusTrap` and dismiss on `Escape`.
- **Portals:** Modals and Floating elements render outside the React DOM hierarchy into `document.body` via React Portals.
- **Screen Reader Support:** All interactive icons include `aria-label` or `aria-hidden` attributes.
- **Color Contrast:** All token combinations strictly adhere to WCAG 2.1 AA (minimum 4.5:1 ratio).
