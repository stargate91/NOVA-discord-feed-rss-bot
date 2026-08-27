import type { ComponentType } from 'react';

export type RouteLayoutType = 'public' | 'dashboard' | 'blank';

export interface RouteMeta {
  title?: string;
  titleKey?: string;
  description?: string;
  requiresAuth?: boolean;
  requiresGuild?: boolean;
  requiresGuildManage?: boolean;
  fallbackRedirect?: string;
  isLocalized?: boolean;
  hideFromSitemap?: boolean;
  roles?: string[];
}

export interface AppRouteDefinition {
  id: string;
  path: string;
  isIndex?: boolean;
  component: ComponentType;
  layout?: RouteLayoutType;
  meta?: RouteMeta;
  children?: AppRouteDefinition[];
}
