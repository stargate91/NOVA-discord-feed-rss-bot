"use client";

import React from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Info } from 'lucide-react';
import CryptoPairsEditor from './crypto_pairs_editor';
import MonitorFormFields from './monitor_form_fields';
import { Modal } from '@/components/ui';
import { PLATFORMS } from '@/constants';
import {
  supportsAutocomplete,
  formatAutocompleteSubtitle,
  supportsNativePlayer,
} from '@/utils';
import { useCreateMonitorWizard } from '@/hooks/use_create_monitor_wizard';
import styles from './create_monitor_modal.module.css';

interface CreateMonitorModalProps {
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMonitorModal({ 
  guildId, 
  isOpen, 
  onClose, 
  onSuccess, 
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
    dropdownRef,
    isLocked,
    handleClose,
    handlePlatformSelect,
    handleYouTubeResolve,
    addCryptoPair,
    removeCryptoPair,
    updateCryptoPair,
    handleInputChange,
    selectAutocompleteItem,
    insertTemplateVariable,
    handleSubmit,
  } = useCreateMonitorWizard({
    guildId,
    isOpen,
    onClose,
    onSuccess,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={
        <div>
          <h3 className={styles["modal-title"]}>Add New Monitor</h3>
          <p className={styles["modal-subtitle"]}>Choose a platform to start</p>
        </div>
      }
    >


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

                <CryptoPairsEditor
                  cryptoPairs={cryptoPairs}
                  onUpdatePair={updateCryptoPair}
                  onAddPair={addCryptoPair}
                  onRemovePair={removeCryptoPair}
                />
              </div>
            ) : selectedPlatform && !selectedPlatform.isGlobal && (
              <div className={styles["form-group"]}>
                <div className={styles["form-label-row"]}>
                  <label className={styles["form-label"]}>{selectedPlatform.inputLabel}</label>
                  <div className={styles["hint-badge"]}><Info size={12} /> {selectedPlatform.hint}</div>
                </div>
                <div>
                  {supportsAutocomplete(selectedPlatform.id) ? (
                    <div className={styles["autocomplete-container"]} ref={dropdownRef}>
                      <input
                        type="text"
                        value={autoQuery || formData.platform_input}
                        onChange={(e) => {
                          setAutoQuery(e.target.value);
                          handleInputChange('platform_input', e.target.value);
                        }}
                        onFocus={() => autoResults.length > 0}
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
                                  {formatAutocompleteSubtitle(selectedPlatform.id, item)}
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

                  {supportsNativePlayer(selectedPlatform.id) && (
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
                
                {supportsNativePlayer(selectedPlatform.id) && resolvedChannel && (
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
          </div>

          {/* ── Centralized Common Form Fields ── */}
          {selectedPlatform && (
            <MonitorFormFields
              platformId={selectedPlatform.id}
              formData={formData}
              onChange={handleInputChange}
              guildChannels={guildChannels}
              guildRoles={guildRoles}
              loadingChannelsRoles={loadingContext}
              isLocked={isLocked}
              insertTemplateVariable={insertTemplateVariable}
              isSectionPadded
            />
          )}

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
    </Modal>
  );
}

