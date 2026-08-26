import { useBilling, UseBillingOptions, BillingInterval } from './use_billing';

export type { BillingInterval };

/**
 * @deprecated Use `useBilling` directly from `@/hooks/use_billing`.
 */
export function usePricingPlanSelection(options?: UseBillingOptions) {
  return useBilling(options);
}

export default usePricingPlanSelection;
