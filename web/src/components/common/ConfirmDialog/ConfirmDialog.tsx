import type { FC } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import type { ConfirmOptions } from './types';
import { Modal, Button, Inline, Text } from '@/ui';

export interface ConfirmDialogProps extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title = 'Please Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle size={20} color="var(--status-danger)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--status-warning)" />;
      case 'primary':
      default:
        return <HelpCircle size={20} color="var(--accent-primary)" />;
    }
  };

  return (
    <Modal open size="sm" onClose={onCancel}>
      <Modal.Header>
        <Inline align="center" gap="sm">
          {getIcon()}
          <Modal.Title>{title}</Modal.Title>
        </Inline>
      </Modal.Header>
      <Modal.Body>
        <Text color="secondary">{message}</Text>
      </Modal.Body>
      <Modal.Footer>
        <Inline justify="end" gap="xs">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </Inline>
      </Modal.Footer>
    </Modal>
  );
};
