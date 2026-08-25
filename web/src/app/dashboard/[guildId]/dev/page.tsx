"use client";

import React from "react";
import {
  Trash2,
  Copy,
  Check,
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
import devService from "@/services/dev_service";
import {
  DEV_ROTATION_OPTIONS,
  DEV_ACTIVITY_OPTIONS,
  DEV_DURATION_OPTIONS,
  DEV_TIER_OPTIONS,
} from "@/constants/tiers";
import { useToast } from "@/context/toast_context";
import { useDevControls } from "@/hooks/use_dev_controls";
import styles from "./dev.module.css";

export default function DevSettingsPage() {
  const { addToast } = useToast();

  const {
    keys,
    duration,
    setDuration,
    customDays,
    setCustomDays,
    maxUses,
    setMaxUses,
    tier,
    setTier,
    generating,
    copying,
    handleGenerate,
    handleDeleteKey,
    handleRevokeKey,
    copyToClipboard,
    showBroadcast,
    setShowBroadcast,
    showPresence,
    setShowPresence,
    showPremium,
    setShowPremium,
    showMaintenance,
    setShowMaintenance,
    statuses,
    rotationMode,
    setRotationMode,
    rotationInterval,
    setRotationInterval,
    newStatusType,
    setNewStatusType,
    newStatusText,
    setNewStatusText,
    statusLoading,
    handleAddStatus,
    handleDeleteStatus,
    announcements,
    newAnnounce,
    setNewAnnounce,
    announceLoading,
    handleSendAnnouncement,
    handleDeleteAnnouncement,
    modalConfig,
    setModalConfig,
  } = useDevControls();

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
