"use client";

import React from 'react';
import Image from 'next/image';
import MultiSelect from './multi_select';
import { X, ChevronRight, ChevronLeft, Info, Plus, Trash2 } from 'lucide-react';
import ColorPicker from './color_picker';
import { MOVIE_GENRES, LANGUAGES, getAvailableVars } from '@/lib/monitor_constants';
import { PLATFORMS } from '@/constants/platforms';
import { useCreateMonitorWizard } from '@/hooks/use_create_monitor_wizard';
import styles from './create_monitor_modal.module.css';

interface CreateMonitorModalProps {
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tier?: number;
  isPremium?: boolean;
}

export default function CreateMonitorModal({ 
  guildId, 
  isOpen, 
  onClose, 
  onSuccess, 
  tier = 0, 
  isPremium = false 
}: CreateMonitorModalProps) {
  const {
    step,
    setStep,
    selectedPlatform,
    formData,
    cryptoPairs,
    guildChannels,
    guildRoles,
    loadingContext,
    creating,
    resolving,
    resolvedChannel,
    autoQuery,
    setAutoQuery,
    autoResults,
    showAutoDropdown,
    setShowAutoDropdown,
    dropdownRef,
    isLocked,
    handleClose,
    handlePlatformSelect,
    handleYouTubeResolve,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    handleInputChange,
    handleMultiChange,
    handleToggleChange,
    handleColorChange,
    selectAutocompleteItem,
    insertTemplateVariable,
    handleSubmit,
  } = useCreateMonitorWizard({
    guildId,
    isOpen,
    onClose,
    onSuccess,
    tier,
    isPremium,
  });

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <div>
            <h3 className={styles["modal-title"]}>Add New Monitor</h3>
            <p className={styles["modal-subtitle"]}>Choose a platform to start</p>
          </div>
          <button 
            type="button" 
            className={styles["modal-close-btn"]} 
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div className={styles["platform-grid"]}>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles["platform-card"]}
                onClick={() => handlePlatformSelect(p)}
              >
                <div className={styles["platform-icon-wrap"]}>
                  <Image 
                    src={p.logo} 
                    alt={p.name} 
                    width={28} 
                    height={28} 
                    unoptimized 
                  />
                </div>
                <div className={styles["platform-info"]}>
                  <span className={styles["platform-name"]}>{p.name}</span>
                  <span className={styles["platform-desc"]}>{p.description}</span>
                </div>
                <ChevronRight size={18} className={styles["platform-arrow"]} />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles["form-body"]}>
            <div className={styles["form-section-padded"]}>
              <h4 className={styles["section-label-accent"]}>Essential Config</h4>
              <div className={styles["form-group"]}>
                <label className={styles["form-label"]} htmlFor="monitor-name-input">
                  Monitor Name
                </label>
                <input
                  id="monitor-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="ui-input"
                  placeholder="e.g. My Favorite Streamer"
                />
              </div>

              {selectedPlatform?.isCrypto ? (
                <div className={styles["form-group"]}>
                  <div className={styles["form-label-row"]}>
                    <label className={styles["form-label"]}>Price Alert Targets</label>
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
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}

                    <div className={styles["crypto-actions"]}>
                      <button
                        type="button"
                        onClick={addCryptoPair}
                        className={styles["btn-add-coin"]}
                      >
                        <Plus size={14} /> Add Another Coin
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedPlatform && !selectedPlatform.isGlobal && (
                <div className={styles["form-group"]}>
                  <div className={styles["form-label-row"]}>
                    <label className={styles["form-label"]}>{selectedPlatform.inputLabel}</label>
                    <div className={styles["hint-badge"]}><Info size={12} /> {selectedPlatform.hint}</div>
                  </div>
                  <div>
                    {['steam_news', 'twitch', 'github'].includes(selectedPlatform.id) ? (
                      <div className={styles["autocomplete-container"]} ref={dropdownRef}>
                        <input
                          type="text"
                          value={autoQuery || formData.platform_input}
                          onChange={(e) => {
                            setAutoQuery(e.target.value);
                            handleInputChange('platform_input', e.target.value);
                          }}
                          onFocus={() => autoResults.length > 0 && setShowAutoDropdown(true)}
                          required
                          className="ui-input"
                          placeholder={selectedPlatform.placeholder}
                          aria-label={selectedPlatform.inputLabel}
                        />
                        {showAutoDropdown && autoResults.length > 0 && (
                          <div className={styles["autocomplete-dropdown"]}>
                            {autoResults.map((item) => (
                              <button 
                                key={item.id} 
                                type="button"
                                className={styles["autocomplete-item"]}
                                onClick={() => selectAutocompleteItem(item)}
                              >
                                <Image 
                                  src={item.thumbnail || "/nova_thumbnail.jpg"} 
                                  alt={item.name} 
                                  width={40} 
                                  height={40} 
                                  unoptimized 
                                  className={selectedPlatform.id === 'twitch' ? styles["item-img-twitch"] : styles["item-img-default"]} 
                                />
                                <div className={styles["item-details"]}>
                                  <span className={styles["item-name"]}>
                                    {item.name} {item.is_live && <span className={styles["live-badge"]}>LIVE</span>}
                                  </span>
                                  <span className={styles["item-sub"]}>
                                    {selectedPlatform.id === 'github' ? `⭐ ${item.stars} - ${item.id}` : `ID: ${item.id}`}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData.platform_input}
                        onChange={(e) => handleInputChange('platform_input', e.target.value)}
                        required
                        className="ui-input"
                        placeholder={selectedPlatform.placeholder}
                        aria-label={selectedPlatform.inputLabel}
                      />
                    )}

                    {selectedPlatform.id === 'youtube' && (
                      <button
                        type="button"
                        onClick={handleYouTubeResolve}
                        className="ui-btn"
                        disabled={resolving || !formData.platform_input}
                      >
                        {resolving ? 'Checking...' : (resolvedChannel ? 'Change' : 'Verify')}
                      </button>
                    )}
                  </div>
                  
                  {selectedPlatform.id === 'youtube' && resolvedChannel && (
                    <div className={styles["validation-chip"]}>
                      <div className={styles["chip-avatar-wrap"]}>
                        <Image 
                          src={resolvedChannel.thumbnail || "/nova_thumbnail.jpg"} 
                          alt="" 
                          width={36} 
                          height={36} 
                          unoptimized 
                        />
                        <div className={styles["verified-badge"]}>✓</div>
                      </div>
                      <div className={styles["chip-info"]}>
                        <span className={styles["chip-title"]}>{resolvedChannel.title}</span>
                        <span className={styles["chip-subtitle"]}>Channel Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPlatform?.id === 'epic_games' && (
                <div className={styles["toggle-section"]}>
                  <div className={styles["toggle-text-wrap"]}>
                    <label htmlFor="create-include-upcoming" className={styles["toggle-label"]}>
                      Include Upcoming Games
                    </label>
                    <p className={styles["toggle-desc"]}>
                      Also notify about the free games coming next week.
                    </p>
                  </div>
                  <label className="ui-switch">
                    <input
                      type="checkbox"
                      id="create-include-upcoming"
                      checked={formData.include_upcoming}
                      onChange={(e) => handleToggleChange('include_upcoming', e.target.checked)}
                    />
                    <span className="ui-switch-slider"></span>
                  </label>
                </div>
              )}
            </div>

            {(selectedPlatform?.id === 'movie' || selectedPlatform?.id === 'tv_series') && (
              <div className={styles["form-section-padded"]}>
                <h4 className={styles["section-label-accent"]}>Advanced Filters</h4>
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
              </div>
            )}

            <div className={styles["form-section-padded"]}>
              <h4 className={styles["section-label-accent"]}>Notification Settings</h4>
              <div className={styles["grid-2"]}>
                <div className={styles["form-group"]}>
                  <span className={styles["form-label"]}>Target Channels</span>
                  <MultiSelect
                    options={guildChannels}
                    value={formData.target_channels}
                    onChange={(val) => handleMultiChange('target_channels', val)}
                    placeholder={loadingContext ? "Loading..." : "Select channels"}
                  />
                </div>
                <div className={styles["form-group"]}>
                  <span className={styles["form-label"]}>Ping Roles</span>
                  <MultiSelect
                    options={guildRoles}
                    value={formData.target_roles}
                    onChange={(val) => handleMultiChange('target_roles', val)}
                    placeholder={loadingContext ? "Loading..." : "Select roles"}
                  />
                </div>
              </div>

              <div className={styles["custom-alert-box"]}>
                <div className={styles["form-label-row"]}>
                  <label htmlFor="create-custom-alert" className={styles["form-label"]}>
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
                    id="create-custom-alert"
                    name="custom_alert"
                    value={formData.custom_alert}
                    onChange={(e) => handleInputChange('custom_alert', e.target.value)}
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
                  {getAvailableVars(selectedPlatform?.id || '').map((v) => (
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

              {['twitch', 'kick'].includes(selectedPlatform?.id || '') && (
                <div className={styles["toggle-section"]}>
                  <div className={styles["toggle-text-wrap"]}>
                    <label htmlFor="create-send-initial-alert" className={styles["toggle-label"]}>
                      Send initial alert
                    </label>
                    <p className={styles["toggle-desc"]}>
                      Post an update immediately if the source is already live or has new items.
                    </p>
                  </div>
                  <label className="ui-switch">
                    <input
                      id="create-send-initial-alert"
                      type="checkbox"
                      checked={formData.send_initial_alert}
                      onChange={(e) => handleToggleChange('send_initial_alert', e.target.checked)}
                    />
                    <span className="ui-switch-slider"></span>
                  </label>
                </div>
              )}

              {selectedPlatform?.id === 'youtube' && (
                <div className={styles["toggle-section"]}>
                  <div className={styles["toggle-text-wrap"]}>
                    <label htmlFor="create-use-native-player" className={styles["toggle-label"]}>
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
                        id="create-use-native-player"
                        type="checkbox"
                        checked={formData.use_native_player}
                        onChange={(e) => handleToggleChange('use_native_player', e.target.checked)}
                      />
                      <span className="ui-switch-slider"></span>
                    </label>
                  )}
                </div>
              )}

              {(!['youtube'].includes(selectedPlatform?.id || '') || (selectedPlatform?.id === 'youtube' && !formData.use_native_player)) && (
                <div className={styles["form-group"]}>
                  <div className={styles["form-label-row"]}>
                    <span className={styles["form-label"]}>Embed Color</span>
                    {isLocked("custom_color") && (
                      <div className={styles["hint-badge"]}>
                        <Info size={12} /> Starter Tier+
                      </div>
                    )}
                  </div>
                  <ColorPicker 
                    value={formData.embed_color} 
                    onChange={handleColorChange}
                    disabled={isLocked("custom_color")}
                  />
                </div>
              )}

              <div className={styles["custom-alert-box"]}>
                <div className={styles["form-label-row"]}>
                  <label htmlFor="create-custom-image" className={styles["form-label"]}>
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
                    id="create-custom-image"
                    type="text"
                    value={formData.custom_image}
                    onChange={(e) => handleInputChange('custom_image', e.target.value)}
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
            </div>

            <div className={styles["modal-footer"]}>
              <button 
                type="button" 
                className={`ui-btn ${styles["btn-secondary"]}`} 
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button 
                type="submit" 
                className="ui-btn ui-btn-primary" 
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Monitor'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
