import type { ElementType, ReactNode, ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';
import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'discord'
  | 'danger'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'glass'
  | 'link'
  | 'soft'
  | 'gradient'
  | 'danger-outline'
  | 'danger-ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export type ButtonProps<C extends ElementType = 'button'> = {
  as?: C;
} & ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<C>, keyof ButtonBaseProps | 'as' | 'size'>;

export type PolymorphicButton = <C extends ElementType = 'button'>(
  props: ButtonProps<C> & { ref?: ComponentPropsWithRef<C>['ref'] }
) => React.ReactElement | null;

const ButtonRender = <C extends ElementType = 'button'>(
  props: ButtonProps<C>,
  ref?: ComponentPropsWithRef<C>['ref']
): React.ReactElement | null => {
  const {
    as,
    variant = 'secondary',
    size = 'md',
    fullWidth = false,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    leftIcon,
    rightIcon,
    iconOnly = false,
    children,
    className = '',
    disabled,
    ...rest
  } = props;

  const Component = as || 'button';
  const isDisabled = disabled || loading;

  const variantClassMap: Record<ButtonVariant, string> = {
    primary: styles.primary,
    secondary: styles.secondary,
    discord: styles.discord,
    danger: styles.danger,
    outline: styles.outline,
    ghost: styles.ghost,
    success: styles.success,
    glass: styles.glass,
    link: styles.link,
    soft: styles.soft,
    gradient: styles.gradient,
    'danger-outline': styles.dangerOutline,
    'danger-ghost': styles.dangerGhost,
  };

  const classes = [
    styles.btn,
    variantClassMap[variant] || styles.secondary,
    styles[size],
    iconOnly ? styles.iconOnly : '',
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerSize = size === 'xs' || size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  const effectiveLeftIcon = leftIcon || (iconPosition === 'left' ? icon : null);
  const effectiveRightIcon = rightIcon || (iconPosition === 'right' ? icon : null);

  const isNativeButton = Component === 'button';

  const elementProps: Record<string, unknown> = {
    ref,
    className: classes,
    disabled: isNativeButton ? isDisabled : undefined,
    'aria-disabled': !isNativeButton && isDisabled ? true : undefined,
    'aria-busy': loading ? 'true' : undefined,
    ...rest,
  };

  if (isNativeButton && !elementProps.type) {
    elementProps.type = 'button';
  }

  return React.createElement(
    Component,
    elementProps,
    loading && iconOnly ? (
      <span className={styles.spinner}>
        <Loader2 size={spinnerSize} />
      </span>
    ) : (
      <>
        {loading && !iconOnly && (
          <span className={styles.spinner}>
            <Loader2 size={spinnerSize} />
          </span>
        )}
        {!loading && effectiveLeftIcon && (
          <span className={styles.icon}>{effectiveLeftIcon}</span>
        )}
        {loading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children && <span>{children}</span>
        )}
        {!loading && effectiveRightIcon && (
          <span className={styles.icon}>{effectiveRightIcon}</span>
        )}
      </>
    )
  );
};

export const Button = React.forwardRef(
  ButtonRender as unknown as React.ForwardRefRenderFunction<unknown, ButtonBaseProps>
) as unknown as PolymorphicButton;
