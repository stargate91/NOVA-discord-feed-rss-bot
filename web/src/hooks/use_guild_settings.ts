import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DiscordRole, GuildSettings } from '@/types/guild';
import settingsService from '@/services/settings_service';
import billingService from '@/services/billing_service';
import { useToast } from '@/context/toast_context';
import { useConfig } from '@/hooks/use_config';
import { parseCustomBranding, updateBrandingField } from '@/utils/branding';

const MASTER_GUILD_ID = '1083433370815582240';

export function useGuildSettings(guildId: string) {
  const router = useRouter();
  const { addToast, showSuccess } = useToast();
  const { getTierConfig, hasFeature } = useConfig();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [guildRoles, setGuildRoles] = useState<DiscordRole[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const [settings, setSettings] = useState<GuildSettings>({
    language: 'en',
    admin_role_id: '0',
    refresh_interval: 20,
    alert_templates: {},
    tier: 0,
    isMaster: false,
    hasStripeSubscription: false,
    custom_branding: null,
    premium_until: null,
  });

  const reloadSettings = useCallback(async () => {
    if (!guildId) return;
    try {
      const sData = await settingsService.getSettings(guildId);
      if (guildId === MASTER_GUILD_ID) {
        sData.isMaster = true;
      }
      setSettings(sData);
    } catch (error) {
      console.error('Failed to reload settings data:', error);
    }
  }, [guildId]);

  useEffect(() => {
    if (!guildId) {
      router.push('/servers');
      return;
    }

    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sData, roles] = await Promise.all([
          settingsService.getSettings(guildId),
          settingsService.getRoles(guildId),
        ]);

        if (ignore) return;
        if (guildId === MASTER_GUILD_ID) {
          sData.isMaster = true;
        }

        setSettings(sData);
        setGuildRoles(roles);
      } catch (error) {
        console.error('Failed to fetch settings data:', error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [guildId, router]);

  const isServerPremium = Boolean(settings.isMaster || (settings.tier || 0) > 0);
  const activeTierLevel = settings.isMaster ? 3 : settings.tier || 0;
  const currentTierConfig = getTierConfig(activeTierLevel, isServerPremium);
  const effectiveMinInterval = currentTierConfig?.min_interval ?? 20;

  const isIntervalLocked = useCallback(
    (val: number) => {
      if (settings.isMaster) return false;
      return val < effectiveMinInterval;
    },
    [settings.isMaster, effectiveMinInterval]
  );

  const canUseTemplates = Boolean(
    settings.isMaster || hasFeature(activeTierLevel, isServerPremium, 'custom_templates')
  );
  const canUseBranding = Boolean(
    settings.isMaster || hasFeature(activeTierLevel, isServerPremium, 'custom_branding')
  );

  const handleSave = async () => {
    if (!guildId) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(guildId, settings);
      showSuccess();
      addToast('Settings updated successfully!', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Failed to update settings', 'error');
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

  const parsedBranding = parseCustomBranding(settings.custom_branding);

  const handleBrandingChange = (key: string, val: any) => {
    const updated = updateBrandingField(parsedBranding, key, val);
    setSettings((prev) => ({
      ...prev,
      custom_branding: updated as any,
    }));
  };

  const openBillingPortal = async () => {
    if (!guildId) return;
    setPortalLoading(true);
    try {
      const url = await settingsService.getBillingPortalUrl(guildId);
      if (url) window.location.href = url;
    } catch (e) {
      console.error('Billing portal error:', e);
      addToast('Failed to open billing portal', 'error');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!guildId || !redeemCode.trim()) return;
    setRedeeming(true);
    try {
      const data = await billingService.redeemPromoCode(redeemCode, guildId);
      if (data.success) {
        addToast('Promo code activated successfully!', 'success');
        setRedeemCode('');
        await reloadSettings();
      } else {
        addToast((data as any).error || 'Failed to redeem code', 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Network error occurred', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  return {
    settings,
    setSettings,
    guildRoles,
    loading,
    saving,
    portalLoading,
    redeemCode,
    setRedeemCode,
    redeeming,
    parsedBranding,
    isServerPremium,
    activeTierLevel,
    currentTierConfig,
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
    openBillingPortal,
    handleRedeem,
  };
}

