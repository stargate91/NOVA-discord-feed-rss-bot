export interface PricingButtonStateParams {
  isLoading?: boolean;
  isMaster?: boolean;
  isCurrentPlan: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  isFree: boolean;
  isPopular?: boolean;
}

export function getPricingButtonLabel(params: PricingButtonStateParams): string {
  if (params.isLoading) return 'Processing...';
  if (params.isMaster) return 'Master Access';
  if (params.isCurrentPlan) return 'Current Plan';
  if (params.isUpgrade) return 'Upgrade Now';
  if (params.isDowngrade) return 'Switch Plan';
  if (params.isFree) return 'Current Plan';
  return 'Get Started';
}

export function getPricingButtonVariant(
  params: PricingButtonStateParams
): 'primary' | 'secondary' {
  if (
    params.isPopular &&
    !params.isCurrentPlan &&
    !params.isMaster &&
    !params.isFree
  ) {
    return 'primary';
  }
  return 'secondary';
}
