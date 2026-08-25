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

export interface PricingCardStateOptions {
  tier?: number;
  currentTier?: number;
  isMaster?: boolean;
  isLoading?: boolean;
  isPopular?: boolean;
}

export interface PricingCardState {
  isCurrentPlan: boolean;
  isFree: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  isDisabled: boolean;
  canPurchase: boolean;
  buttonLabel: string;
  buttonVariant: 'primary' | 'secondary';
}

export function calculatePricingCardState(options: PricingCardStateOptions): PricingCardState {
  const tier = options.tier ?? 0;
  const currentTier = options.currentTier ?? 0;
  const isMaster = Boolean(options.isMaster);
  const isLoading = Boolean(options.isLoading);
  const isPopular = Boolean(options.isPopular);

  const isCurrentPlan = tier === currentTier && !isMaster;
  const isFree = tier === 0;
  const isUpgrade = tier > currentTier && !isMaster;
  const isDowngrade = tier < currentTier && !isMaster;

  const buttonParams: PricingButtonStateParams = {
    isLoading,
    isMaster,
    isCurrentPlan,
    isUpgrade,
    isDowngrade,
    isFree,
    isPopular,
  };

  const isDisabled = isFree || isCurrentPlan || isMaster || isLoading;
  const canPurchase = !isFree && !isCurrentPlan && !isMaster && !isLoading;
  const buttonLabel = getPricingButtonLabel(buttonParams);
  const buttonVariant = getPricingButtonVariant(buttonParams);

  return {
    isCurrentPlan,
    isFree,
    isUpgrade,
    isDowngrade,
    isDisabled,
    canPurchase,
    buttonLabel,
    buttonVariant,
  };
}

export interface ComparisonCellValue {
  type: 'boolean' | 'text';
  booleanValue?: boolean;
  textValue?: string;
  isHighlighted: boolean;
}

export function parseComparisonCellValue(
  val: string | boolean,
  isHighlighted?: boolean
): ComparisonCellValue {
  if (typeof val === 'boolean') {
    return {
      type: 'boolean',
      booleanValue: val,
      isHighlighted: Boolean(isHighlighted),
    };
  }
  return {
    type: 'text',
    textValue: String(val),
    isHighlighted: Boolean(isHighlighted),
  };
}


