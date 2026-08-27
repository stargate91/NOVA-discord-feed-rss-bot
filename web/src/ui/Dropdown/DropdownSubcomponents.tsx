import type { HTMLAttributes } from 'react';
import React from 'react';
import type { DropdownHeaderProps, DropdownEmptyProps } from './types';
import styles from './Dropdown.module.css';

export const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.header} ${className}`} {...rest}>
    {children}
  </div>
);

export const DropdownDivider: React.FC<HTMLAttributes<HTMLHRElement>> = ({
  className = '',
  ...rest
}) => <hr className={`${styles.divider} ${className}`} {...rest} />;

export const DropdownEmpty: React.FC<DropdownEmptyProps> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.empty} ${className}`} {...rest}>
    {children}
  </div>
);
