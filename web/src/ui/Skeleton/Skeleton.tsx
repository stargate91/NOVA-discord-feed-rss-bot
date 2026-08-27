import type { ReactNode } from 'react';
import React, { memo } from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';
export type SkeletonAspectRatio = 'square' | 'video' | 'poster' | 'banner';
export type SkeletonWidth = 'quarter' | 'third' | 'half' | 'two-thirds' | 'three-quarters' | 'full';
export type SkeletonHeight = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'card' | 'hero';
export type SkeletonAvatarSize = 'sm' | 'md' | 'lg';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  aspectRatio?: SkeletonAspectRatio;
  width?: SkeletonWidth;
  height?: SkeletonHeight;
  avatarSize?: SkeletonAvatarSize;
  lines?: number;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

const SkeletonComponent: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'shimmer',
  aspectRatio,
  width = 'full',
  height,
  avatarSize,
  lines,
  loading = true,
  children,
  className = '',
  id,
}) => {
  // Conditional rendering wrapper support
  if (children !== undefined && !loading) {
    return <>{children}</>;
  }

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return styles.animPulse;
      case 'none':
        return styles.animNone;
      case 'shimmer':
      default:
        return styles.animShimmer;
    }
  };

  const getWidthClass = (w: SkeletonWidth) => {
    switch (w) {
      case 'quarter':
        return styles.wQuarter;
      case 'third':
        return styles.wThird;
      case 'half':
        return styles.wHalf;
      case 'two-thirds':
        return styles.wTwoThirds;
      case 'three-quarters':
        return styles.wThreeQuarters;
      case 'full':
      default:
        return styles.wFull;
    }
  };

  const getHeightClass = (h?: SkeletonHeight) => {
    if (!h) return '';
    switch (h) {
      case 'xs':
        return styles.hXs;
      case 'sm':
        return styles.hSm;
      case 'md':
        return styles.hMd;
      case 'lg':
        return styles.hLg;
      case 'xl':
        return styles.hXl;
      case 'card':
        return styles.hCard;
      case 'hero':
        return styles.hHero;
      default:
        return '';
    }
  };

  const getAspectRatioClass = (ratio?: SkeletonAspectRatio) => {
    if (!ratio) return '';
    switch (ratio) {
      case 'square':
        return styles.aspectSquare;
      case 'video':
        return styles.aspectVideo;
      case 'poster':
        return styles.aspectPoster;
      case 'banner':
        return styles.aspectBanner;
      default:
        return '';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return styles.circular;
      case 'rectangular':
        return styles.rectangular;
      case 'rounded':
        return styles.rounded;
      case 'text':
      default:
        return styles.text;
    }
  };

  const getAvatarClass = (size?: SkeletonAvatarSize) => {
    if (!size) return '';
    switch (size) {
      case 'sm':
        return styles.avatarSm;
      case 'lg':
        return styles.avatarLg;
      case 'md':
      default:
        return styles.avatarMd;
    }
  };

  // Multi-line text paragraph skeleton
  if (lines && lines > 1) {
    const lineElements: ReactNode[] = [];
    for (let i = 0; i < lines; i++) {
      const isLast = i === lines - 1;
      const lineWidth = isLast ? 'two-thirds' : 'full';
      lineElements.push(
        <span
          key={`skeleton-line-${i}`}
          className={`${styles.skeleton} ${styles.text} ${getAnimationClass()} ${getWidthClass(lineWidth)} ${getHeightClass(height)}`}
        />
      );
    }
    return (
      <div id={id} className={`${styles.textStack} ${className}`}>
        {lineElements}
      </div>
    );
  }

  const classes = [
    styles.skeleton,
    getVariantClass(),
    getAnimationClass(),
    getAspectRatioClass(aspectRatio),
    getWidthClass(width),
    getHeightClass(height),
    getAvatarClass(avatarSize),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span id={id} className={classes} aria-hidden="true" />;
};

export const Skeleton = memo(SkeletonComponent);
