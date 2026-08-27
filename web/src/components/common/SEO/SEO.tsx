import type React from 'react';
import type { SEOProps } from './useSEO';
import { useSEO } from './useSEO';

export const SEO: React.FC<SEOProps> = (props) => {
  useSEO(props);
  return null;
};
