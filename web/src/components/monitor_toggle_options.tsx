"use client";

import React from 'react';
import { Info } from 'lucide-react';
import {
  supportsLiveAlerts,
  supportsNativePlayer,
  supportsUpcomingGames,
} from '@/utils';
import { TierFeatureName } from '@/utils/tier_limits';
import styles from './monitor_form_fields.module.css';

export interface MonitorToggleOptionsProps {
  platformId?: string;
  sendInitialAlert?: boolean;
  onChangeSendInitialAlert?: (checked: boolean) => void;
  useNativePlayer?: boolean;
  onChangeUseNativePlayer?: (checked: boolean) => void;
  includeUpcoming?: boolean;
  onChangeIncludeUpcoming?: (checked: boolean) => void;
  isLocked?: (featureName: TierFeatureName) => boolean;
}

export const MonitorToggleOptions: React.FC<MonitorToggleOptionsProps> = ({
  platformId = '',
  sendInitialAlert = false,
  onChangeSendInitialAlert,
  useNativePlayer = false,
  onChangeUseNativePlayer,
  includeUpcoming = false,
  onChangeIncludeUpcoming,
  isLocked = () => false,
}) => {
  return (
    <>
      {/* Live Alerts Toggle */}
      {supportsLiveAlerts(platformId) && (
        <div className={styles["toggle-section"]}>
          <div className={styles["toggle-text-wrap"]}>
            <label htmlFor="monitor-send-initial-alert" className={styles["toggle-label"]}>
              Send initial alert
            </label>
            <p className={styles["toggle-desc"]}>
              Post an update immediately if the source is already live or has new items.
            </p>
          </div>
          <label className="ui-switch">
            <input
              id="monitor-send-initial-alert"
              type="checkbox"
              checked={sendInitialAlert}
              onChange={(e) => onChangeSendInitialAlert?.(e.target.checked)}
            />
            <span className="ui-switch-slider"></span>
          </label>
        </div>
      )}

      {/* Native Discord Player Toggle */}
      {supportsNativePlayer(platformId) && (
        <div className={styles["toggle-section"]}>
          <div className={styles["toggle-text-wrap"]}>
            <label htmlFor="monitor-use-native-player" className={styles["toggle-label"]}>
              Use Native Discord Player
            </label>
            <p className={styles["toggle-desc"]}>
              Bypass the custom layout and let Discord embed the video directly.
            </p>
          </div>
          {isLocked("native_player") ? (
            <div className={styles["hint-badge"]}>
              <Info size={12} /> Starter Tier+
            </div>
          ) : (
            <label className="ui-switch">
              <input
                id="monitor-use-native-player"
                type="checkbox"
                checked={useNativePlayer}
                onChange={(e) => onChangeUseNativePlayer?.(e.target.checked)}
              />
              <span className="ui-switch-slider"></span>
            </label>
          )}
        </div>
      )}

      {/* Upcoming Games Toggle */}
      {supportsUpcomingGames(platformId) && (
        <div className={styles["toggle-section"]}>
          <div className={styles["toggle-text-wrap"]}>
            <label htmlFor="monitor-include-upcoming" className={styles["toggle-label"]}>
              Include Upcoming Games
            </label>
            <p className={styles["toggle-desc"]}>
              Also notify about the free games coming next week.
            </p>
          </div>
          <label className="ui-switch">
            <input
              id="monitor-include-upcoming"
              type="checkbox"
              checked={includeUpcoming}
              onChange={(e) => onChangeIncludeUpcoming?.(e.target.checked)}
            />
            <span className="ui-switch-slider"></span>
          </label>
        </div>
      )}
    </>
  );
};

export default MonitorToggleOptions;
