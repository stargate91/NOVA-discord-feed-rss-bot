"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Globe,
  Shield,
  Crown,
  Save,
  Search,
  ChevronDown,
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
  Inline,
  Stack,
  Text,
} from "@/components/ui";
import SettingCard from "@/components/SettingCard";
import TemplateEditor from "@/components/TemplateEditor";
import { useToast } from "@/context/ToastContext";
import { useConfig } from "@/hooks/useConfig";
import settingsService from "@/services/settingsService";
import billingService from "@/services/billingService";
import { DiscordRole, GuildSettings } from "@/types/guild";
import { BOT_LANGUAGES } from "@/constants";
import styles from "./settings.module.css";

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

  const selectedRole = roles.find((r) => r.id === value);
  const filteredRoles = roles.filter((r) =>
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
    <div className={styles["role-select-wrapper"]} ref={dropdownRef}>
      <div
        className={styles["role-trigger"]}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className={styles["role-value-box"]}>
          <div
            className={styles["role-dot"]}
            style={{
              backgroundColor: selectedRole?.color
                ? `#${selectedRole.color.toString(16).padStart(6, "0")}`
                : "var(--border-subtle)",
            }}
          />
          <span>
            {selectedRole ? selectedRole.name : "None (Owner & Admins only)"}
          </span>
        </div>
        <ChevronDown size={16} />
      </div>

      {isOpen && (
        <div className={styles["role-menu"]}>
          <div style={{ padding: "var(--space-2xs)", marginBottom: "var(--space-xs)" }}>
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>

          <div
            className={[
              styles["role-option"],
              (value === "0" || !value) && styles.active,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              onChange("0");
              setIsOpen(false);
            }}
          >
            <div className={styles["role-dot"]} style={{ background: "transparent", border: "1px dashed var(--border-light)" }} />
            <span>None (Owner & Admins only)</span>
          </div>

          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className={[
                styles["role-option"],
                value === role.id && styles.active,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onChange(role.id);
                setIsOpen(false);
              }}
            >
              <div
                className={styles["role-dot"]}
                style={{
                  backgroundColor: role.color
                    ? `#${role.color.toString(16).padStart(6, "0")}`
                    : "var(--text-muted)",
                }}
              />
              <span>{role.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsContent() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const guildId = (params?.guildId as string) || "";
  const { addToast, showSuccess } = useToast();

  const { getTierConfig, hasFeature } = useConfig();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [guildRoles, setGuildRoles] = useState<DiscordRole[]>([]);
  const [redeemCode, setRedeemCode] = useState("");
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
    premium_until: null,
  });

  useEffect(() => {
    if (!guildId) {
      router.push("/servers");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [sData, roles] = await Promise.all([
          settingsService.getSettings(guildId),
          settingsService.getRoles(guildId),
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
    try {
      await settingsService.updateSettings(guildId, settings);
      showSuccess();
      addToast("Settings updated successfully!", "success");
    } catch (error: any) {
      addToast(error?.message || "Failed to update settings", "error");
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

  const parsedBranding: Record<string, any> =
    typeof settings.custom_branding === "object" && settings.custom_branding !== null
      ? settings.custom_branding
      : typeof settings.custom_branding === "string"
      ? (() => {
          try {
            return JSON.parse(settings.custom_branding);
          } catch {
            return {};
          }
        })()
      : {};

  const handleBrandingChange = (key: string, val: any) => {
    const updated = {
      ...parsedBranding,
      [key]: val === "" ? null : val,
    };
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
      console.error(e);
      addToast("Failed to open billing portal", "error");
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
        addToast("Promo code activated successfully!", "success");
        setRedeemCode("");

        const sData = await settingsService.getSettings(guildId);
        if (guildId === "1083433370815582240") {
          sData.isMaster = true;
        }
        setSettings(sData);
      } else {
        addToast((data as any).error || "Failed to redeem code", "error");
      }
    } catch (err: any) {
      addToast(err?.message || "Network error occurred", "error");
    } finally {
      setRedeeming(false);
    }
  };

  const isServerPremium = settings.isMaster || (settings.tier || 0) > 0;
  const activeTierLevel = settings.isMaster ? 3 : settings.tier || 0;
  const currentTierConfig = getTierConfig(activeTierLevel, isServerPremium);
  const effectiveMinInterval = currentTierConfig?.min_interval ?? 20;

  const isIntervalLocked = (val: number) => {
    if (settings.isMaster) return false;
    return val < effectiveMinInterval;
  };

  const canUseTemplates =
    settings.isMaster || hasFeature(activeTierLevel, isServerPremium, "custom_templates");
  const canUseBranding =
    settings.isMaster || hasFeature(activeTierLevel, isServerPremium, "custom_branding");

  if (loading) {
    return (
      <Stack align="center" justify="center" gap="lg" style={{ paddingBlock: "8rem" }}>
        <Spinner size="lg" label="Loading server settings..." />
      </Stack>
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
                  {settings.isMaster ? "Master Access" : currentTierConfig?.name || "Free Plan"}
                </span>
                <span className={styles["status-sub"]}>
                  {settings.isMaster ? "Lifetime Unlimited" : activeTierLevel > 0 ? "Active Subscription" : "Standard Tier"}
                </span>
              </div>
            </div>

            {activeTierLevel > 0 && !settings.isMaster && settings.premium_until && (
              <div className={styles["expiry-row"]}>
                <span>Renews / Expires:</span>
                <strong>
                  {new Date(settings.premium_until).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
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
              <Link href={`/dashboard/${guildId}/billing`} style={{ width: "100%" }}>
                <Button variant={activeTierLevel > 0 ? "secondary" : "primary"} size="md" fullWidth>
                  {activeTierLevel > 0 ? "Upgrade / Manage Plan" : "Upgrade to Premium"}
                </Button>
              </Link>
            )}
          </div>

          {/* Promo Code Redemption Card */}
          <div className={styles["status-card"]}>
            <div className={styles["status-header"]}>
              <div className={styles["status-icon-box"]} style={{ background: "var(--accent-faint)", color: "var(--accent-light)", borderColor: "var(--border-accent)" }}>
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
