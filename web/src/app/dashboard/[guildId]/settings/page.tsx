"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Globe,
  Shield,
  Crown,
  Save,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronDown,
  Clock,
  MessageSquare,
  Lock,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import SettingCard from '@/components/SettingCard';
import TemplateEditor from '@/components/TemplateEditor';
import LoginButton from '@/components/LoginButton';
import { useConfig } from '@/hooks/useConfig';
import settingsService from '@/services/settingsService';
import billingService from '@/services/billingService';
import { DiscordRole, GuildSettings } from '@/types/guild';
import styles from './settings.module.css';

// --- Custom Role Select Component ---
interface CustomRoleSelectProps {
  roles: DiscordRole[];
  value: string;
  onChange: (value: string) => void;
}

function CustomRoleSelect({ roles, value, onChange }: CustomRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedRole = roles.find(r => r.id === value);
  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.customSelectContainer} ref={dropdownRef}>
      <div
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.selectedValue}>
          <div
            className={styles.roleDot}
            style={{ backgroundColor: selectedRole?.color ? `#${selectedRole.color.toString(16).padStart(6, '0')}` : 'transparent', border: !selectedRole?.color ? '1px dashed rgba(255,255,255,0.3)' : 'none' }}
          ></div>
          <span className={!selectedRole ? styles.placeholder : ''}>
            {selectedRole ? selectedRole.name : "None (Owner & Admins only)"}
          </span>
        </div>
        <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
      </div>

      {isOpen && (
        <div className={styles.selectDropdown}>
          <div className={styles.selectSearchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.selectSearchInput}
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className={styles.selectOptions}>
            <div
              className={`${styles.selectOption} ${(value === '0' || !value) ? styles.active : ''}`}
              onClick={() => {
                onChange('0');
                setIsOpen(false);
              }}
            >
              <div className={`${styles.roleDot} ${styles.transparent}`}></div>
              <span>None (Owner & Admins only)</span>
            </div>

            {filteredRoles.map(role => (
              <div
                key={role.id}
                className={`${styles.selectOption} ${value === role.id ? styles.active : ''}`}
                onClick={() => {
                  onChange(role.id);
                  setIsOpen(false);
                }}
              >
                <div
                  className={styles.roleDot}
                  style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}
                ></div>
                <span style={{ color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : 'white' }}>{role.name}</span>
              </div>
            ))}

            {filteredRoles.length === 0 && search && (
              <div className={styles.selectNoResults}>No roles found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsContent() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const guildId = (params?.guildId as string) || '';

  const { config, getTierConfig, hasFeature } = useConfig();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [guildRoles, setGuildRoles] = useState<DiscordRole[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const [settings, setSettings] = useState<GuildSettings>({
    language: "en",
    admin_role_id: "0",
    refresh_interval: 20,
    alert_templates: {},
    tier: 0,
    isMaster: false,
    hasStripeSubscription: false,
    custom_branding: null,
    premium_until: null
  });

  useEffect(() => {
    if (!guildId) {
      router.push('/servers');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [sData, roles] = await Promise.all([
          settingsService.getSettings(guildId),
          settingsService.getRoles(guildId)
        ]);

        if (guildId === "1083433370815582240") {
          sData.isMaster = true;
        }
        
        setSettings(sData);
        setGuildRoles(roles);
      } catch (error) {
        console.error("Failed to fetch settings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guildId, router]);

  const handleSave = async () => {
    if (!guildId) return;
    setSaving(true);
    setNotification(null);

    try {
      await settingsService.updateSettings(guildId, settings);
      setNotification({ type: 'success', message: 'Settings updated successfully!' });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      setNotification({ type: 'error', message: error?.message || 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const handleRoleChange = (roleId: string) => {
    setSettings(prev => ({ ...prev, admin_role_id: roleId }));
  };

  const handleIntervalChange = (val: number) => {
    setSettings(prev => ({ ...prev, refresh_interval: val }));
  };

  const handleTemplateUpdate = (platform: string, newTemplateValue: string) => {
    setSettings(prev => ({
      ...prev,
      alert_templates: {
        ...(prev.alert_templates || {}),
        [platform]: newTemplateValue
      }
    }));
  };

  const parsedBranding: Record<string, any> = typeof settings.custom_branding === 'object' && settings.custom_branding !== null
    ? settings.custom_branding
    : (typeof settings.custom_branding === 'string'
      ? (() => { try { return JSON.parse(settings.custom_branding); } catch { return {}; } })()
      : {});

  const handleBrandingChange = (key: string, val: any) => {
    const updated = {
      ...parsedBranding,
      [key]: val === "" ? null : val
    };
    setSettings(prev => ({
      ...prev,
      custom_branding: updated as any
    }));
  };

  const openBillingPortal = async () => {
    if (!guildId) return;
    setPortalLoading(true);
    try {
      const url = await settingsService.getBillingPortalUrl(guildId);
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setNotification({ type: 'error', message: 'Failed to open billing portal.' });
    }
    setPortalLoading(false);
  };

  const handleRedeem = async () => {
    if (!guildId || !redeemCode.trim()) return;
    setRedeeming(true);
    try {
      const data = await billingService.redeemPromoCode(redeemCode, guildId);
      if (data.success) {
        setNotification({ type: 'success', message: 'Code redeemed successfully!' });
        setRedeemCode('');
        
        const sData = await settingsService.getSettings(guildId);
        if (guildId === "1083433370815582240") {
          sData.isMaster = true;
        }
        setSettings(sData);
      } else {
        setNotification({ type: 'error', message: (data as any).error || 'Failed to redeem code' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Network error occurred.' });
    }
    setRedeeming(false);
  };

  const isServerPremium = settings.isMaster || (settings.tier || 0) > 0;
  const activeTierLevel = settings.isMaster ? 3 : (settings.tier || 0);
  const currentTierConfig = getTierConfig(activeTierLevel, isServerPremium);
  const effectiveMinInterval = currentTierConfig?.min_interval ?? 20;

  const isIntervalLocked = (val: number) => {
    if (settings.isMaster) return false;
    return val < effectiveMinInterval;
  };

  const canUseTemplates = settings.isMaster || hasFeature(activeTierLevel, isServerPremium, 'custom_templates');
  const canUseBranding = settings.isMaster || hasFeature(activeTierLevel, isServerPremium, 'custom_branding');

  if (loading) {
    return (
      <div className="ui-loading-fullscreen">
        <div className={styles.buttonLoader} style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <header className="ui-dashboard-header">
        <div className="ui-dashboard-info">
          <h1 className="ui-dashboard-title">Server Settings</h1>
          <p className="ui-dashboard-subtitle">Configure bot behavior, alerts, and access controls for this server.</p>
        </div>

        <div className="page-header-actions">
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className={styles.buttonLoader}></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
          <LoginButton session={session} />
        </div>
      </header>

      {notification && (
        <div className={`${styles.notificationBanner} ${styles[notification.type]}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className={styles.settingsGrid}>
        <div className={styles.settingsMain}>

          {/* 1. Language Setting */}
          <SettingCard
            title="Bot Language"
            description="Select the language used for automated messages and bot interfaces."
            icon={Globe}
          >
            <div className={styles.languageToggle}>
              <button
                type="button"
                className={`${styles.langBtn} ${settings.language === 'en' ? styles.active : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <span className={styles.flagIconImg}>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                className={`${styles.langBtn} ${settings.language === 'hu' ? styles.active : ''}`}
                onClick={() => handleLanguageChange('hu')}
              >
                <span className={styles.flagIconImg}>🇭🇺</span>
                <span>Magyar</span>
              </button>
            </div>
          </SettingCard>

          {/* 2. Admin Role Setting */}
          <SettingCard
            title="Admin Role"
            description="Members with this role can manage bot monitors and configure server settings."
            icon={Shield}
          >
            <CustomRoleSelect
              roles={guildRoles}
              value={settings.admin_role_id || '0'}
              onChange={handleRoleChange}
            />
          </SettingCard>

          {/* 3. Refresh Interval */}
          <SettingCard
            title="Refresh Interval"
            description="Set how frequently the bot checks for new content. Higher tiers unlock faster intervals."
            icon={Clock}
          >
            <div className={styles.intervalInputWrapper}>
              <div className={styles.speedTiers}>
                {[20, 10, 5, 2, 1].map((val) => {
                  const locked = isIntervalLocked(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      className={`${styles.speedChip} ${settings.refresh_interval === val ? styles.active : ''} ${locked ? styles.locked : ''}`}
                      onClick={() => !locked && handleIntervalChange(val)}
                      title={locked ? "Upgrade tier to unlock faster refresh rates" : undefined}
                    >
                      {locked && <Lock size={12} />}
                      {val} {val === 1 ? 'min' : 'mins'}
                    </button>
                  );
                })}
              </div>
            </div>
          </SettingCard>

          {/* 4. Custom Alert Templates */}
          <SettingCard
            title="Custom Alert Templates"
            description="Personalize notification formatting using custom markdown and platform tags."
            icon={MessageSquare}
          >
            <TemplateEditor
              templates={settings.alert_templates || {}}
              onUpdate={handleTemplateUpdate}
              isLocked={!canUseTemplates}
              guildId={guildId}
              styles={styles}
            />
          </SettingCard>

          {/* 5. Custom Branding */}
          <SettingCard
            title="Custom Branding"
            description="Override bot avatar and footer branding in feeds (Ultimate Tier feature)."
            icon={Zap}
          >
            {!canUseBranding ? (
              <div className={styles.premiumLockOverlay}>
                <Lock size={32} />
                <p>Available for Ultimate Tier & above</p>
                <Link href={`/dashboard/${guildId}/billing`}>
                  <button className={styles.upgradeBtnSmall}>Upgrade Now</button>
                </Link>
              </div>
            ) : (
              <div className={styles.brandingInputWrapper}>
                <input
                  type="text"
                  placeholder="Custom Footer Text (e.g. Powered by MyCommunity)"
                  className={styles.brandingInput}
                  value={parsedBranding.footer_text || ""}
                  onChange={(e) => handleBrandingChange("footer_text", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Custom Footer Icon URL (https://...)"
                  className={styles.brandingInput}
                  value={parsedBranding.footer_icon_url || ""}
                  onChange={(e) => handleBrandingChange("footer_icon_url", e.target.value)}
                />
              </div>
            )}
          </SettingCard>

        </div>

        {/* Right Sidebar: Status & Redeem */}
        <div className={styles.settingsSidebar}>
          
          <div className={`${styles.premiumStatusCard} ${activeTierLevel > 0 ? styles.premiumActive : ''}`}>
            <div className={styles.premiumHeader}>
              <div className={styles.premiumIcon}>
                <Crown size={28} />
              </div>
              <div>
                <h4>{settings.isMaster ? 'Master Access' : currentTierConfig?.name || 'Free Plan'}</h4>
                <p>{settings.isMaster ? 'Lifetime Unlimited' : (activeTierLevel > 0 ? 'Active Subscription' : 'Standard Tier')}</p>
              </div>
            </div>

            {activeTierLevel > 0 && !settings.isMaster && settings.premium_until && (
              <div>
                <div className={styles.expiryLabel}>Renews / Expires:</div>
                <div className={styles.expiryDate}>
                  {new Date(settings.premium_until).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            )}

            {settings.hasStripeSubscription ? (
              <button 
                className={styles.manageSubBtn}
                onClick={openBillingPortal}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening...' : 'Manage Stripe Subscription'}
              </button>
            ) : (
              <Link href={`/dashboard/${guildId}/billing`} style={{ width: '100%' }}>
                <button className={styles.upgradeBtn}>
                  {activeTierLevel > 0 ? 'Upgrade / Manage Plan' : 'Upgrade to Premium'}
                </button>
              </Link>
            )}
          </div>

          {/* Promo Code Redemption Box */}
          <div className={`${styles.premiumStatusCard} ${styles.redeemCard}`} style={{ marginTop: '1.5rem' }}>
            <div className={styles.premiumHeader}>
              <div className={styles.redeemIcon}>
                <Zap size={28} />
              </div>
              <div>
                <h4>Redeem Code</h4>
                <p>Have a promo key? Activate it here.</p>
              </div>
            </div>

            <div className={styles.redeemInputWrapper}>
              <input
                type="text"
                placeholder="PREM-XXXX-XXXX"
                className={styles.redeemInput}
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                disabled={redeeming}
              />
              <button
                className={styles.redeemBtn}
                onClick={handleRedeem}
                disabled={redeeming || !redeemCode.trim()}
              >
                {redeeming ? '...' : 'Apply'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="ui-loading-fullscreen">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
