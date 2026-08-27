import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Text.module.css';

export type TextSize =
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'base'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | 'hero';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'accent'
  | 'cyan'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'gradient';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  mono?: boolean;
  truncate?: boolean;
  lineClamp?: 1 | 2 | 3 | 4;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Text: React.FC<TextProps> = ({
  as: Component = 'span',
  size,
  weight,
  color,
  align,
  mono = false,
  truncate = false,
  lineClamp,
  italic = false,
  underline = false,
  strikethrough = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const sizeMap: Record<TextSize, string> = {
    '3xs': styles.size3xs,
    '2xs': styles.size2xs,
    xs: styles.sizeXs,
    sm: styles.sizeSm,
    base: styles.sizeBase,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
    '2xl': styles.size2xl,
    '3xl': styles.size3xl,
    '4xl': styles.size4xl,
    '5xl': styles.size5xl,
    '6xl': styles.size6xl,
    hero: styles.sizeHero,
  };

  const weightMap: Record<TextWeight, string> = {
    regular: styles.weightRegular,
    medium: styles.weightMedium,
    semibold: styles.weightSemibold,
    bold: styles.weightBold,
    extrabold: styles.weightExtrabold,
    black: styles.weightBlack,
  };

  const colorMap: Record<TextColor, string> = {
    primary: styles.colorPrimary,
    secondary: styles.colorSecondary,
    muted: styles.colorMuted,
    brand: styles.colorBrand,
    accent: styles.colorAccent,
    cyan: styles.colorCyan,
    success: styles.colorSuccess,
    warning: styles.colorWarning,
    danger: styles.colorDanger,
    info: styles.colorInfo,
    purple: styles.colorPurple,
    gradient: styles.colorGradient,
  };

  const alignMap: Record<TextAlign, string> = {
    left: styles.alignLeft,
    center: styles.alignCenter,
    right: styles.alignRight,
    justify: styles.alignJustify,
  };

  const clampClass = lineClamp ? styles[`clamp${lineClamp}`] : '';

  const classes = [
    styles.text,
    size ? sizeMap[size] : '',
    weight ? weightMap[weight] : '',
    color ? colorMap[color] : '',
    align ? alignMap[align] : '',
    mono ? styles.mono : '',
    truncate ? styles.truncate : '',
    clampClass,
    italic ? styles.italic : '',
    underline ? styles.underline : '',
    strikethrough ? styles.strikethrough : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component id={id} className={classes} {...rest}>
      {children}
    </Component>
  );
};
