"use client";

import React from 'react';
import Image from 'next/image';
import MultiSelect from './multi_select';
import { X, Plus, Trash2, Info } from 'lucide-react';
import ColorPicker from './color_picker';
import { MonitorConfig } from '@/types/monitor';
import { MOVIE_GENRES, LANGUAGES, getAvailableVars } from '@/lib/monitor_constants';
import {
  getPlatformLogo,
  isCryptoPlatform,
  supportsNativePlayer,
  supportsMediaFilters,
  supportsCustomEmbedColor,
  supportsUpcomingGames,
} from '@/utils';
import { useEditMonitor } from '@/hooks/use_edit_monitor';
import styles from './edit_monitor_modal.module.css';

interface EditMonitorModalProps {
  monitor: MonitorConfig | null;
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updateData: Partial<MonitorConfig> & Record<string, any>) => Promise<boolean | void>;
  tier?: number;
  isPremium?: boolean;
}

export default function EditMonitorModal({ 
  monitor, 
  guildId, 
  isOpen, 
  onClose, 
  onSave, 
  tier = 0, 
  isPremium = false 
}: EditMonitorModalProps) {
  const {
    formData,
    cryptoPairs,
    guildChannels,
    guildRoles,
    loadingData,
    saving,
    isLocked,
    handleChange,
    handleMultiChange,
    insertTemplateVariable,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    handleSubmit,
  } = useEditMonitor({
    monitor,
    guildId,
    isOpen,
    onClose,
    onSave,
    tier,
    isPremium,
  });

  if (!isOpen || !monitor) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <div className={styles["platform-icon-wrap"]}>
            <Image 
              src={getPlatformLogo(monitor.type)} 
              alt="" 
              width={32} 
              height={32} 
              unoptimized 
            />
          </div>
          <div className={styles["header-text"]}>
            <h3 className={styles["modal-title"]}>Edit Monitor</h3>
            <p className={styles["modal-subtitle"]}>
              {monitor.name} 
              <span className={styles["type-pill"]}>{monitor.type}</span>
            </p>
          </div>
          <button 
            type="button" 
            className={styles["modal-close-btn"]} 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles["form-body"]}>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]} htmlFor="edit-monitor-name">Monitor Name</label>
            <input
              id="edit-monitor-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="ui-input"
              placeholder="Enter a descriptive name"
            />
          </div>

          {isCryptoPlatform(monitor.type) && (
            <div className={styles["crypto-box"]}>
              <div className={styles["form-label-row"]}>
                <span className={styles["form-label"]}>Price Alert Targets</span>
                <div className={styles["hint-badge"]}><Info size={12} /> Set coin and threshold</div>
              </div>

              <div className={styles["form-group"]}>
                {cryptoPairs.map((pair, idx) => (
                  <div key={idx} className={styles["crypto-row"]}>
                    <input
                      type="text"
                      placeholder="BTC"
                      value={pair.symbol}
                      onChange={(e) => updateCryptoPair(idx, 'symbol', e.target.value)}
                      className="ui-input"
                      required
                      aria-label={`Coin symbol ${idx + 1}`}
                    />
                    <span className={styles["crypto-sep"]}>:</span>
                    <input
                      type="number"
                      placeholder="50000"
                      value={pair.threshold}
                      onChange={(e) => updateCryptoPair(idx, 'threshold', e.target.value)}
                      className="ui-input"
                      required
                      aria-label={`Price threshold ${idx + 1}`}
                    />
                    {cryptoPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCryptoPair(idx)}
                        className={styles["btn-delete-coin"]}
                        aria-label={`Remove coin ${idx + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={addCryptoPair}
                    className={styles["btn-add-coin"]}
                  >
                    <Plus size={16} /> Add Another Coin
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles["custom-alert-box"]}>
            <div className={styles["form-label-row"]}>
              <label htmlFor="edit-custom-alert" className={styles["form-label"]}>
                Custom Alert Message
              </label>
              {isLocked("alert_template") ? (
                <div className={styles["hint-badge"]}>
                  <Info size={12} /> Professional Tier Required
                </div>
              ) : (
                <div className={styles["hint-badge-success"]}>
                  <Info size={12} /> Overrides server defaults
                </div>
              )}
            </div>
            <div className={styles["textarea-relative"]}>
              <textarea
                id="edit-custom-alert"
                name="custom_alert"
                value={formData.custom_alert}
                onChange={handleChange}
                className="ui-input ui-textarea"
                placeholder={isLocked("alert_template") ? "Unlock Professional Tier to customize messages" : `Leave empty to use default.\nExample: @everyone Here is a new post: {title}`}
                rows={3}
                disabled={isLocked("alert_template")}
              />
              {isLocked("alert_template") && (
                <div className={styles["locked-overlay"]}>
                  <span className={styles["locked-badge"]}>Professional Tier+</span>
                </div>
              )}
            </div>

            <div className={styles["var-buttons-row"]}>
              {getAvailableVars(monitor.type).map(v => (
                <button
                  key={v}
                  type="button"
                  className={styles["var-btn"]}
                  onClick={() => insertTemplateVariable(v)}
                  title={`Insert {${v}}`}
                  disabled={isLocked("alert_template")}
                >
                  {`{${v}}`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles["grid-2"]}>
            <div className={styles["form-group"]}>
              <span className={styles["form-label"]}>Target Channels</span>
              <MultiSelect
                options={guildChannels}
                value={formData.target_channels}
                onChange={(val) => handleMultiChange('target_channels', val)}
                placeholder={loadingData ? "Loading..." : "Select channels"}
              />
            </div>
            <div className={styles["form-group"]}>
              <span className={styles["form-label"]}>Ping Roles</span>
              <MultiSelect
                options={guildRoles}
                value={formData.target_roles}
                onChange={(val) => handleMultiChange('target_roles', val)}
                placeholder={loadingData ? "Loading..." : "Select roles"}
              />
            </div>
          </div>

          {supportsNativePlayer(monitor.type) && (
            <div className={styles["toggle-section"]}>
              <div className={styles["toggle-text-wrap"]}>
                <label htmlFor="edit-use-native-player" className={styles["toggle-label"]}>
                  Use Native Discord Player
                </label>
                <p className={styles["toggle-desc"]}>
                  Bypass the custom layout and let Discord embed the video directly.
                </p>
              </div>
              {isLocked("custom_color") ? (
                <div className={styles["hint-badge"]}>
                  <Info size={12} /> Starter Tier+
                </div>
              ) : (
                <label className="ui-switch">
                  <input 
                    type="checkbox" 
                    id="edit-use-native-player"
                    name="use_native_player"
                    checked={formData.use_native_player} 
                    onChange={handleChange}
                  />
                  <span className="ui-switch-slider"></span>
                </label>
              )}
            </div>
          )}

          {supportsMediaFilters(monitor.type) && (
            <div className={`${styles["grid-2"]} ${styles["grid-relative"]}`}>
              <div className={styles["form-group"]}>
                <span className={styles["form-label"]}>Target Genres</span>
                <MultiSelect
                  options={MOVIE_GENRES}
                  value={formData.target_genres}
                  onChange={(val) => handleMultiChange('target_genres', val)}
                  placeholder={isLocked("genre_filter") ? "Unlock Starter Tier" : "Select genres"}
                />
              </div>
              <div className={styles["form-group"]}>
                <span className={styles["form-label"]}>Languages</span>
                <MultiSelect
                  options={LANGUAGES}
                  value={formData.target_languages}
                  onChange={(val) => handleMultiChange('target_languages', val)}
                  placeholder={isLocked("tmdb_language_filter") ? "Unlock Starter Tier" : "Select languages"}
                />
              </div>
              {(isLocked("genre_filter") || isLocked("tmdb_language_filter")) && (
                <div className={styles["locked-overlay"]}>
                  <span className={styles["locked-badge"]}>Starter Tier+</span>
                </div>
              )}
            </div>
          )}

          {supportsCustomEmbedColor(monitor.type, formData.use_native_player) && (
            <div className={styles["form-group"]}>
              <div className={styles["form-label-row"]}>
                <span className={styles["form-label"]}>Embed Accent Color</span>
                {isLocked("custom_color") && (
                  <div className={styles["hint-badge"]}>
                    <Info size={12} /> Starter Tier+
                  </div>
                )}
              </div>
              <ColorPicker 
                value={formData.embed_color || '#3d3f45'} 
                onChange={(color) => !isLocked("custom_color") && handleMultiChange('embed_color', color)}
                disabled={isLocked("custom_color")}
              />
            </div>
          )}

          <div className={styles["custom-alert-box"]}>
            <div className={styles["form-label-row"]}>
              <label htmlFor="edit-custom-image" className={styles["form-label"]}>
                Custom Image URL
              </label>
              {isLocked("custom_color") ? (
                <div className={styles["hint-badge"]}>
                  <Info size={12} /> Starter Tier Required
                </div>
              ) : (
                <div className={styles["hint-badge-success"]}>
                  <Info size={12} /> Imgur, Discord, etc.
                </div>
              )}
            </div>
            <div className={styles["textarea-relative"]}>
              <input
                id="edit-custom-image"
                type="text"
                name="custom_image"
                value={formData.custom_image}
                onChange={handleChange}
                className="ui-input"
                placeholder={isLocked("custom_color") ? "Unlock Starter Tier to use custom images" : "https://imgur.com/example.png"}
                disabled={isLocked("custom_color")}
              />
              {isLocked("custom_color") && (
                <div className={styles["locked-overlay"]}>
                  <span className={styles["locked-badge"]}>Starter Tier+</span>
                </div>
              )}
            </div>
          </div>

          {supportsUpcomingGames(monitor.type) && (
            <div className={styles["toggle-section"]}>
              <div className={styles["toggle-text-wrap"]}>
                <label htmlFor="edit-include-upcoming" className={styles["toggle-label"]}>
                  Include Upcoming Games
                </label>
                <p className={styles["toggle-desc"]}>
                  Also notify about the free games coming next week.
                </p>
              </div>
              <label className="ui-switch">
                <input
                  type="checkbox"
                  id="edit-include-upcoming"
                  name="include_upcoming"
                  checked={formData.include_upcoming}
                  onChange={handleChange}
                />
                <span className="ui-switch-slider"></span>
              </label>
            </div>
          )}

          <div className={styles["modal-footer"]}>
            <button 
              type="button" 
              className={`ui-btn ${styles["btn-secondary"]}`} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="ui-btn ui-btn-primary" 
              disabled={saving || loadingData}
            >
              {saving ? 'Saving...' : 'Update Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
