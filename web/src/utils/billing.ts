export interface StripeProductItem {
  tier: number;
  interval: 'mo' | 'yr' | string;
  [key: string]: any;
}

export function findStripePriceId(
  products: Record<string, StripeProductItem> | undefined,
  tier: number,
  interval: 'mo' | 'yr'
): string | null {
  if (!products) return null;
  const priceId = Object.keys(products).find((pid) => {
    const p = products[pid];
    return p.tier === tier && p.interval === interval;
  });
  return priceId || null;
}
