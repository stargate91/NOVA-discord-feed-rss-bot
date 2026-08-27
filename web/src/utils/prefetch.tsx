import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { prefetchRoute } from './prefetchUtils';

export interface PrefetchLinkProps extends Omit<LinkProps, 'prefetch'> {
  prefetch?: boolean;
}

/**
 * Intelligent Link component that prefetches target route chunks on mouse hover or focus.
 */
export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  to,
  prefetch = true,
  onMouseEnter,
  onFocus,
  children,
  ...rest
}) => {
  const targetPath = typeof to === 'string' ? to : to.pathname || '';

  const handlePrefetch = () => {
    if (prefetch && targetPath) {
      prefetchRoute(targetPath);
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={(e) => {
        handlePrefetch();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        handlePrefetch();
        onFocus?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
};
