"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import {
  Globe,
  Shield,
  Crown,
  Save,
  Clock,
  MessageSquare,
  Lock,
  Zap,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Badge,
  Input,
  Spinner,
} from "@/components/ui";
import SettingCard from "@/components/setting_card";
import TemplateEditor from "@/components/template_editor";
import CustomRoleSelect from "@/components/custom_role_select";
import { BOT_LANGUAGES } from "@/constants";
import { formatExpiryDate } from "@/utils";
import { useGuildSettings } from "@/hooks/use_guild_settings";
import styles from "./settings.module.css";

function SettingsContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || "";

  const {
    settings,
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
  } = useGuildSettings(guildId);

  if (loading) {
    return (
      <div className={styles["loading-stack"]}>
        <Spinner size="lg" label="Loading server settings..." />
      </div>
    );
  }

  return (
    <div className={styles["settings-container"]}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Server Settings"
        description="Configure bot behavior, permissions, and custom message formats."
        badge={
          <Badge variant="primary" size="sm">
            {settings.isMaster ? "Master Tier" : isServerPremium ? "Premium Active" : "Free Plan"}
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Save size={16} />}
            isLoading={saving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        }
      />

      <div className={styles["settings-grid"]}>
        {/* ── Main Settings Column ── */}
        <div className={styles["settings-main"]}>
          {/* 1. Bot Language */}
          <SettingCard
            title="Bot Language"
            description="Select the language used for automated messages and bot interfaces."
            icon={Globe}
          >
            <div className={styles["language-grid"]}>
              {BOT_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={[
                    styles["lang-btn"],
                    settings.language === lang.code && styles.active,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className={styles["flag-emoji"]}>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </SettingCard>

          {/* 2. Admin Role */}
          <SettingCard
            title="Admin Role"
            description="Members with this role can manage bot monitors and configure server settings."
            icon={Shield}
          >
            <CustomRoleSelect
              roles={guildRoles}
              value={settings.admin_role_id || "0"}
              onChange={handleRoleChange}
            />
          </SettingCard>

          {/* 3. Refresh Interval */}
          <SettingCard
            title="Refresh Interval"
            description="Set how frequently the bot checks for new content. Higher tiers unlock faster intervals."
            icon={Clock}
          >
            <div className={styles["speed-chips"]}>
              {[20, 10, 5, 2, 1].map((val) => {
                const locked = isIntervalLocked(val);
                return (
                  <button
                    key={val}
                    type="button"
                    className={[
                      styles["speed-chip"],
                      settings.refresh_interval === val && styles.active,
                      locked && styles.locked,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => !locked && handleIntervalChange(val)}
                    title={locked ? "Upgrade tier to unlock faster refresh rates" : undefined}
                  >
                    {locked && <Lock size={12} />}
                    <span>{val} {val === 1 ? "min" : "mins"}</span>
                  </button>
                );
              })}
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
            description="Override bot footer branding in Discord feeds (Ultimate Tier feature)."
            icon={Zap}
          >
            {!canUseBranding ? (
              <div className={styles["lock-overlay"]}>
                <Lock size={28} className={styles["lock-icon"]} />
                <p className="text-body-sm">
                  White-label branding requires <strong>Ultimate Tier</strong>.
                </p>
                <Link href={`/dashboard/${guildId}/billing`}>
                  <Button variant="primary" size="sm">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={styles["branding-wrapper"]}>
                <Input
                  label="Custom Footer Text"
                  placeholder="e.g. Powered by MyCommunity"
                  value={parsedBranding.footer_text || ""}
                  onChange={(e) => handleBrandingChange("footer_text", e.target.value)}
                />
                <Input
                  label="Custom Footer Icon URL"
                  placeholder="https://..."
                  value={parsedBranding.footer_icon_url || ""}
                  onChange={(e) => handleBrandingChange("footer_icon_url", e.target.value)}
                />
              </div>
            )}
          </SettingCard>
        </div>

        {/* ── Right Sidebar: Status & Redeem ── */}
        <div className={styles["settings-sidebar"]}>
          {/* Plan Status Card */}
          <div
            className={[
              styles["status-card"],
              activeTierLevel > 0 && styles["premium-active"],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles["status-header"]}>
              <div className={styles["status-icon-box"]}>
                <Crown size={24} />
              </div>
              <div className={styles["status-info"]}>
                <span className={styles["status-title"]}>
                  {settings.isMaster ? "Master Access" : settings.features?.tierName || "Free Plan"}
                </span>
                <span className={styles["status-sub"]}>
                  {settings.isMaster ? "Lifetime Unlimited" : activeTierLevel > 0 ? "Active Subscription" : "Standard Tier"}
                </span>
              </div>
            </div>

            {activeTierLevel > 0 && !settings.isMaster && settings.premium_until && (
              <div className={styles["expiry-row"]}>
                <span>Renews / Expires:</span>
                <strong>{formatExpiryDate(settings.premium_until)}</strong>
              </div>
            )}

            {settings.hasStripeSubscription ? (
              <Button
                variant="secondary"
                size="md"
                fullWidth
                isLoading={portalLoading}
                onClick={openBillingPortal}
              >
                Manage Stripe Subscription
              </Button>
            ) : (
              <Link href={`/dashboard/${guildId}/billing`} className={styles["upgrade-link"]}>
                <Button variant={activeTierLevel > 0 ? "secondary" : "primary"} size="md" fullWidth>
                  {activeTierLevel > 0 ? "Upgrade / Manage Plan" : "Upgrade to Premium"}
                </Button>
              </Link>
            )}
          </div>

          {/* Promo Code Redemption Card */}
          <div className={styles["status-card"]}>
            <div className={styles["status-header"]}>
              <div className={`${styles["status-icon-box"]} ${styles["promo-icon-box"]}`}>
                <Tag size={24} />
              </div>
              <div className={styles["status-info"]}>
                <span className={styles["status-title"]}>Redeem Code</span>
                <span className={styles["status-sub"]}>Activate a promo key for this server.</span>
              </div>
            </div>

            <div className={styles["redeem-input-row"]}>
              <Input
                placeholder="PREM-XXXX-XXXX"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                disabled={redeeming}
              />
              <Button
                variant="primary"
                size="md"
                isLoading={redeeming}
                disabled={!redeemCode.trim()}
                onClick={handleRedeem}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading..." />}>
      <SettingsContent />
    </Suspense>
  );
}
