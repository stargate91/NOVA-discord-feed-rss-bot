"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Trash2,
  Copy,
  Check,
  Zap,
  X,
  ShieldAlert,
  Activity,
  ChevronDown,
  Radio,
  Key,
  Flame,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Button,
  IconButton,
  Badge,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Inline,
  Stack,
  Text,
} from "@/components/ui";
import LogStreamer from "@/components/log_streamer";
import devService, {
  AnnouncementItem,
  BotStatusItem,
  PremiumKeyItem,
} from "@/services/dev_service";
import {
  DEV_ROTATION_OPTIONS,
  DEV_ACTIVITY_OPTIONS,
  DEV_DURATION_OPTIONS,
  DEV_TIER_OPTIONS,
} from "@/constants/tiers";
import { useToast } from "@/context/toast_context";
import styles from "./dev.module.css";

export default function DevSettingsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [keys, setKeys] = useState<PremiumKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("30");
  const [customDays, setCustomDays] = useState("30");
  const [maxUses, setMaxUses] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [tier, setTier] = useState("3");

  // Section Accordion Toggles
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showPremium, setShowPremium] = useState(true);
  const [showMaintenance, setShowMaintenance] = useState(false);

  // Status & Presence State
  const [statuses, setStatuses] = useState<BotStatusItem[]>([]);
  const [rotationMode, setRotationMode] = useState("random");
  const [rotationInterval, setRotationInterval] = useState("60");
  const [newStatusType, setNewStatusType] = useState("watching");
  const [newStatusText, setNewStatusText] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Broadcast State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newAnnounce, setNewAnnounce] = useState<{
    title: string;
    content: string;
    type: "info" | "warning" | "alert" | "maintenance";
  }>({ title: "", content: "", type: "info" });
  const [announceLoading, setAnnounceLoading] = useState(false);

  // Maintenance Modal State
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: (() => Promise<void>) | null;
    isProcessing: boolean;
  }>({
    show: false,
    title: "",
    message: "",
    action: null,
    isProcessing: false,
  });

  useEffect(() => {
    let ignore = false;
    async function loadDevData() {
      try {
        const [fetchedKeys, fetchedStatuses, botSettings, fetchedAnnouncements] =
          await Promise.all([
            devService.getKeys(),
            devService.getStatuses(),
            devService.getBotSettings(),
            devService.getAnnouncements(),
          ]);

        if (ignore) return;
        if (Array.isArray(fetchedKeys)) setKeys(fetchedKeys);
        if (Array.isArray(fetchedStatuses)) setStatuses(fetchedStatuses);
        if (botSettings.status_rotation_mode)
          setRotationMode(botSettings.status_rotation_mode);
        if (botSettings.presence_interval_seconds)
          setRotationInterval(String(botSettings.presence_interval_seconds));
        if (Array.isArray(fetchedAnnouncements))
          setAnnouncements(fetchedAnnouncements);
      } catch (err) {
        console.error("Error fetching dev data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadDevData();
    return () => {
      ignore = true;
    };
  }, []);

  // --- Keys ---
  const handleGenerate = async () => {
    setGenerating(true);
    const daysToGenerate =
      duration === "custom" ? parseInt(customDays, 10) : parseInt(duration, 10);
    try {
      await devService.generateKey(
        daysToGenerate,
        parseInt(maxUses, 10),
        parseInt(tier, 10)
      );
      addToast("New premium key generated!", "success");
      const newKeys = await devService.getKeys();
      setKeys(newKeys);
    } catch (err: any) {
      addToast(err?.message || "Failed to generate key", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = async (code: string) => {
    try {
      await devService.deleteKey(code);
      setKeys((prev) => prev.filter((k) => k.code !== code));
      addToast("Key deleted", "info");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeKey = async (code: string) => {
    try {
      await devService.revokeKey(code);
      setKeys((prev) =>
        prev.map((k) => (k.code === code ? { ...k, is_revoked: true } : k))
      );
      addToast("Key revoked", "warning");
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(text);
    addToast("Copied to clipboard!", "info");
    setTimeout(() => setCopying(null), 2000);
  };

  // --- Bot Status ---
  const handleAddStatus = async () => {
    if (!newStatusText.trim()) return;
    setStatusLoading(true);
    try {
      await devService.addStatus(newStatusType, newStatusText);
      setNewStatusText("");
      const fetchedStatuses = await devService.getStatuses();
      setStatuses(fetchedStatuses);
      addToast("Status pattern added", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteStatus = async (id: number) => {
    try {
      await devService.deleteStatus(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Announcements ---
  const handleSendAnnouncement = async () => {
    if (!newAnnounce.title || !newAnnounce.content) return;
    setAnnounceLoading(true);
    try {
      await devService.addAnnouncement(newAnnounce);
      setNewAnnounce({ title: "", content: "", type: "info" });
      const fetchedAnnouncements = await devService.getAnnouncements();
      setAnnouncements(fetchedAnnouncements);
      addToast("Announcement broadcasted!", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setAnnounceLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await devService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      addToast("Announcement removed", "info");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles["dev-container"]}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Developer Controls"
        description="Master administrative tools for real-time monitoring, live streams, presence, and license keys."
        badge={
          <Badge variant="master" size="sm">
            MASTER ACCESS
          </Badge>
        }
      />

      {/* ── Log Streamer ── */}
      <LogStreamer />

      {/* ── 1. Global Broadcasts Accordion ── */}
      <div className={styles["section-card"]}>
        <button
          type="button"
          className={styles["section-header"]}
          onClick={() => setShowBroadcast(!showBroadcast)}
          aria-expanded={showBroadcast}
        >
          <div className={styles["section-title-wrap"]}>
            <Activity size={18} color="var(--accent-light)" />
            <span className={styles["section-title"]}>Global Broadcasts</span>
          </div>
          <ChevronDown
            size={18}
            className={`${styles["accordion-chevron"]} ${showBroadcast ? styles.expanded : ""}`}
          />
        </button>

        {showBroadcast && (
          <div className={styles["section-body"]}>
            <div className={styles["broadcast-grid"]}>
              <Stack gap="sm">
                <Input
                  label="Message Title"
                  placeholder="e.g. Scheduled Infrastructure Maintenance"
                  value={newAnnounce.title}
                  onChange={(e) =>
                    setNewAnnounce({ ...newAnnounce, title: e.target.value })
                  }
                />
                <div className="ui-form-group">
                  <label className="text-caption">Content Markdown</label>
                  <textarea
                    placeholder="Broadcast message details..."
                    value={newAnnounce.content}
                    onChange={(e) =>
                      setNewAnnounce({ ...newAnnounce, content: e.target.value })
                    }
                    className={`ui-textarea ${styles["broadcast-textarea"]}`}
                  />
                </div>
                <Inline gap="sm" align="center">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={announceLoading}
                    onClick={handleSendAnnouncement}
                  >
                    Broadcast to Owners
                  </Button>
                </Inline>
              </Stack>

              <div className={styles["announcements-list"]}>
                <span className="text-caption">Active Broadcasts</span>
                {announcements.map((a) => (
                  <div key={a.id} className={styles["announce-card"]}>
                    <Stack gap="3xs">
                      <Badge variant="warning" size="sm">
                        {a.type.toUpperCase()}
                      </Badge>
                      <strong className={styles["announce-title"]}>{a.title}</strong>
                    </Stack>
                    <IconButton
                      icon={<X size={14} />}
                      size="xs"
                      variant="danger"
                      aria-label="Delete announcement"
                      onClick={() => handleDeleteAnnouncement(a.id)}
                    />
                  </div>
                ))}
                {announcements.length === 0 && (
                  <Text as="p" size="xs" variant="muted">
                    No active broadcasts found.
                  </Text>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Discord Bot Presence Accordion ── */}
      <div className={styles["section-card"]}>
        <button
          type="button"
          className={styles["section-header"]}
          onClick={() => setShowPresence(!showPresence)}
          aria-expanded={showPresence}
        >
          <div className={styles["section-title-wrap"]}>
            <Radio size={18} color="var(--accent-light)" />
            <span className={styles["section-title"]}>Discord Bot Presence</span>
          </div>
          <ChevronDown
            size={18}
            className={`${styles["accordion-chevron"]} ${showPresence ? styles.expanded : ""}`}
          />
        </button>

        {showPresence && (
          <div className={styles["section-body"]}>
            <div className={styles["presence-grid"]}>
              <Stack gap="sm">
                <Select
                  label="Rotation Mode"
                  value={rotationMode}
                  onChange={(val) => setRotationMode(val)}
                  options={DEV_ROTATION_OPTIONS}
                />
                <Input
                  label="Interval (Seconds)"
                  type="number"
                  value={rotationInterval}
                  onChange={(e) => setRotationInterval(e.target.value)}
                />
              </Stack>

              <Stack gap="sm">
                <Select
                  label="Activity Type"
                  value={newStatusType}
                  onChange={(val) => setNewStatusType(val)}
                  options={DEV_ACTIVITY_OPTIONS}
                />
                <Inline gap="xs" align="end">
                  <div className={styles["flex-auto"]}>
                    <Input
                      label="Status Pattern"
                      placeholder="e.g. {count} Discord Servers"
                      value={newStatusText}
                      onChange={(e) => setNewStatusText(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={statusLoading}
                    onClick={handleAddStatus}
                  >
                    Add
                  </Button>
                </Inline>
              </Stack>
            </div>

            <div className={styles["statuses-grid"]}>
              {statuses.map((s) => (
                <div key={s.id} className={styles["status-item"]}>
                  <Inline gap="xs" align="center">
                    <Badge variant="neutral" size="sm">
                      {s.type}
                    </Badge>
                    <span>{s.text}</span>
                  </Inline>
                  <IconButton
                    icon={<Trash2 size={14} />}
                    size="xs"
                    variant="danger"
                    aria-label="Delete status"
                    onClick={() => handleDeleteStatus(s.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Premium Key Management Accordion ── */}
      <div className={styles["section-card"]}>
        <button
          type="button"
          className={styles["section-header"]}
          onClick={() => setShowPremium(!showPremium)}
          aria-expanded={showPremium}
        >
          <div className={styles["section-title-wrap"]}>
            <Key size={18} color="var(--status-warning)" />
            <span className={styles["section-title"]}>Promo & Premium Key Generator</span>
          </div>
          <ChevronDown
            size={18}
            className={`${styles["accordion-chevron"]} ${showPremium ? styles.expanded : ""}`}
          />
        </button>

        {showPremium && (
          <div className={styles["section-body"]}>
            <Inline gap="sm" wrap align="end">
              <div className={styles["input-duration"]}>
                <Select
                  label="Duration"
                  value={duration}
                  onChange={(val) => setDuration(val)}
                  options={DEV_DURATION_OPTIONS}
                />
              </div>
              <div className={styles["input-tier"]}>
                <Select
                  label="Tier"
                  value={tier}
                  onChange={(val) => setTier(val)}
                  options={DEV_TIER_OPTIONS}
                />
              </div>
              {duration === "custom" && (
                <div className={styles["input-small"]}>
                  <Input
                    label="Days"
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                  />
                </div>
              )}
              <div className={styles["input-small"]}>
                <Input
                  label="Max Uses"
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                isLoading={generating}
                onClick={handleGenerate}
              >
                Generate Key
              </Button>
            </Inline>

            <div className={styles["keys-grid"]}>
              {keys.map((k) => (
                <div key={k.code} className={styles["key-card"]}>
                  <Stack gap="3xs">
                    <span className={styles["key-code"]}>{k.code}</span>
                    <Inline gap="xs" align="center">
                      <Badge variant="warning" size="sm">
                        Tier {k.tier || 3}
                      </Badge>
                      <span className="text-caption">
                        {k.duration_days === 0 ? "Lifetime" : `${k.duration_days}d`} • {k.used_count}/{k.max_uses} uses
                      </span>
                      {k.is_revoked && (
                        <Badge variant="danger" size="sm">
                          REVOKED
                        </Badge>
                      )}
                    </Inline>
                  </Stack>

                  <Inline gap="3xs">
                    <IconButton
                      icon={copying === k.code ? <Check size={14} /> : <Copy size={14} />}
                      size="xs"
                      variant="ghost"
                      aria-label="Copy key"
                      onClick={() => copyToClipboard(k.code)}
                    />
                    <IconButton
                      icon={<ShieldAlert size={14} />}
                      size="xs"
                      variant="ghost"
                      aria-label="Revoke key"
                      disabled={k.is_revoked}
                      onClick={() => handleRevokeKey(k.code)}
                    />
                    <IconButton
                      icon={<X size={14} />}
                      size="xs"
                      variant="danger"
                      aria-label="Delete key"
                      onClick={() => handleDeleteKey(k.code)}
                    />
                  </Inline>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. System Maintenance & Nuclear Actions ── */}
      <div className={styles["section-card"]}>
        <button
          type="button"
          className={styles["section-header"]}
          onClick={() => setShowMaintenance(!showMaintenance)}
          aria-expanded={showMaintenance}
        >
          <div className={styles["section-title-wrap"]}>
            <Flame size={18} color="var(--status-error)" />
            <span className={styles["section-title"]}>System Maintenance (Danger Zone)</span>
          </div>
          <ChevronDown
            size={18}
            className={`${styles["accordion-chevron"]} ${showMaintenance ? styles.expanded : ""}`}
          />
        </button>

        {showMaintenance && (
          <div className={styles["section-body"]}>
            <div className={styles["nuclear-card"]}>
              <strong className={styles["nuclear-title"]}>
                Nuclear History Reset
              </strong>
              <Text as="p" size="xs" variant="secondary">
                Clears publication history for <strong>ALL</strong> monitors across all servers. Every feed will re-post latest entries.
              </Text>
              <Button
                variant="danger"
                size="md"
                onClick={() =>
                  setModalConfig({
                    show: true,
                    title: "Nuclear History Reset",
                    message: "Are you absolutely sure? Every monitor on every server will re-broadcast its latest post.",
                    action: async () => {
                      await devService.resetHistory();
                      addToast("Nuclear reset completed", "success");
                    },
                    isProcessing: false,
                  })
                }
              >
                Reset All Feed History
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Danger Modal ── */}
      {modalConfig.show && (
        <Modal
          isOpen={modalConfig.show}
          onClose={() => setModalConfig({ ...modalConfig, show: false })}
          size="sm"
        >
          <ModalHeader>
            <ModalTitle>{modalConfig.title}</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <p>{modalConfig.message}</p>
          </ModalContent>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setModalConfig({ ...modalConfig, show: false })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (modalConfig.action) {
                  await modalConfig.action();
                }
                setModalConfig({ ...modalConfig, show: false });
              }}
            >
              Confirm Intent
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
