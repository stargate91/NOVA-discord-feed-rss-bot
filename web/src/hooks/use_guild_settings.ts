import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GuildSettings } from '@/types/guild';
import { useToast } from '@/context/toast_context';
import { useGuildContext } from '@/context/guild_context';
import { useGuildBilling } from '@/hooks/use_guild_billing';
import { TOAST_MESSAGES } from '@/constants/toasts';
import { parseCustomBranding, updateBrandingField } from '@/utils/branding';

const DEFAULT_SETTINGS: GuildSettings = {
  language: 'en',
  admin_role_id: '0',
  refresh_interval: 20,
  alert_templates: {},
  tier: 0,
  isMaster: false,
  hasStripeSubscription: false,
  custom_branding: null,
  premium_until: null,
};

export function useGuildSettings(guildId: string) {
  const router = useRouter();
  const toast = useToast();
  const { showSuccess } = toast;
  const guildCtx = useGuildContext();
  const { tierContext, roles: guildRoles, refreshGuild, updateGuildSettings } = guildCtx;
  const billing = useGuildBilling(guildId);

  const [saving, setSaving] = useState(false);

  const [prevContextSettings, setPrevContextSettings] = useState(guildCtx.settings);
  const [settings, setSettings] = useState<GuildSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...(guildCtx.settings || {}),
  }));

  if (guildCtx.settings !== prevContextSettings) {
    setPrevContextSettings(guildCtx.settings);
    if (guildCtx.settings) {
      setSettings(guildCtx.settings);
    }
  }

  useEffect(() => {
    if (!guildId) {
      router.push('/servers');
    }
  }, [guildId, router]);

  const loading = guildCtx.loading && !guildCtx.settings;
  const isServerPremium = tierContext.isPremium;
  const activeTierLevel = tierContext.effectiveTier;
  const effectiveMinInterval = tierContext.minRefreshInterval;

  const isIntervalLocked = useCallback(
    (val: number) => tierContext.isIntervalLocked(val),
    [tierContext]
  );

  const canUseTemplates = !tierContext.isLocked('custom_template');
  const canUseBranding = !tierContext.isLocked('remove_branding');

  const handleSave = async () => {
    if (!guildId) return;
    setSaving(true);
    try {
      await updateGuildSettings(settings);
      showSuccess();
      toast.success(TOAST_MESSAGES.SETTINGS.UPDATE_SUCCESS);
      await refreshGuild();
    } catch (error: unknown) {
      toast.error(error, TOAST_MESSAGES.SETTINGS.UPDATE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const handleRoleChange = (roleId: string) => {
    setSettings((prev) => ({ ...prev, admin_role_id: roleId }));
  };

  const handleIntervalChange = (val: number) => {
    setSettings((prev) => ({ ...prev, refresh_interval: val }));
  };

  const handleTemplateUpdate = (platform: string, newTemplateValue: string) => {
    setSettings((prev) => ({
      ...prev,
      alert_templates: {
        ...(prev.alert_templates || {}),
        [platform]: newTemplateValue,
      },
    }));
  };

  const parsedBranding = useMemo(
    () => parseCustomBranding(settings.custom_branding),
    [settings.custom_branding]
  );

  const handleBrandingChange = (key: string, val: any) => {
    const updated = updateBrandingField(parsedBranding, key, val);
    setSettings((prev) => ({
      ...prev,
      custom_branding: updated as any,
    }));
  };

  return {
    settings,
    setSettings,
    guildRoles,
    loading,
    saving,
    portalLoading: billing.portalLoading,
    redeemCode: billing.redeemCode,
    setRedeemCode: billing.setRedeemCode,
    redeeming: billing.redeeming,
    parsedBranding,
    isServerPremium,
    activeTierLevel,
    effectiveMinInterval,
    isIntervalLocked,
    canUseTemplates,
    canUseBranding,
    handleSave,
    handleLanguageChange,
    handleRoleChange,
    handleIntervalChange,
    handleTemplateUpdate,
    handleBrandingChange,
    openBillingPortal: billing.openBillingPortal,
    handleRedeem: billing.handleRedeem,
  };
}

export default useGuildSettings;


