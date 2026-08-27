import type React from 'react';
import type { ModalProps } from './types';
import { ModalRoot } from './ModalRoot';
import { ModalHeader, ModalTitle, ModalBody, ModalFooter } from './ModalHeader';

export type * from './types';
export { ModalRoot } from './ModalRoot';
export { ModalHeader, ModalTitle, ModalBody, ModalFooter } from './ModalHeader';

export interface ModalCompound extends React.FC<ModalProps> {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
}

export const Modal = ModalRoot as ModalCompound;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
