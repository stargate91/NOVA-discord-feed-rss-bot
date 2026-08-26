import { useBilling } from './use_billing';

/**
 * @deprecated Use `useBilling({ guildId })` from `@/hooks/use_billing` instead.
 */
export function useGuildBilling(guildId: string) {
  return useBilling({ guildId });
}

export default useGuildBilling;
