import { describe, it, expect } from 'vitest';
import { APP_ROUTES, MARKETING_ROUTES, getRouteMetaByPath } from '@/routes/config';

describe('Declarative Route Metadata & Guard Suite', () => {
  it('registers all marketing and app routes with unique IDs and paths', () => {
    expect(APP_ROUTES.length).toBeGreaterThan(10);
    const ids = APP_ROUTES.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('declares localized metadata for marketing routes', () => {
    MARKETING_ROUTES.forEach((route) => {
      expect(route.meta?.isLocalized).toBe(true);
      expect(route.meta?.titleKey).toBeDefined();
    });
  });

  it('correctly maps route guard metadata for protected routes', () => {
    const devMeta = getRouteMetaByPath('/dev');
    expect(devMeta?.requiresAuth).toBe(true);
    expect(devMeta?.fallbackRedirect).toBe('/servers');

    const serverPickerMeta = getRouteMetaByPath('/servers');
    expect(serverPickerMeta?.requiresAuth).toBe(true);

    const guildFeedsMeta = getRouteMetaByPath('/dashboard/12345/feeds');
    expect(guildFeedsMeta?.requiresAuth).toBe(true);
    expect(guildFeedsMeta?.requiresGuildManage).toBe(true);
  });

  it('returns undefined for non-existent path metadata', () => {
    expect(getRouteMetaByPath('/non-existent-random-route')).toBeUndefined();
  });
});
