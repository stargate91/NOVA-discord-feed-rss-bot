"use client";

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Zap, Check, AlertCircle, ChevronRight, ChevronLeft, RefreshCw, Shield } from "lucide-react";
import MultiSelect from './multi_select';
import ColorPicker from './color_picker';
import { BULK_PLATFORMS } from '@/constants/platforms';
import { supportsCustomEmbedColor, supportsLiveAlerts, supportsNativePlayer } from '@/utils';
import { useBulkAddWizard } from '@/hooks/use_bulk_add_wizard';
import styles from './bulk_add_modal.module.css';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  guildId: string;
  onSuccess?: () => void;
  tier?: number;
  isPremium?: boolean;
  guildLoading?: boolean;
}

const subscribe = () => () => {};

export default function BulkAddModal({ 
  isOpen, 
  onClose, 
  guildId, 
  onSuccess, 
  tier = 0, 
  isPremium = false, 
  guildLoading = false 
}: BulkAddModalProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const {
    step,
    selectedPlatform,
    setSelectedPlatform,
    inputList,
    setInputList,
    targetChannels,
    setTargetChannels,
    targetRoles,
    setTargetRoles,
    embedColor,
    setEmbedColor,
    channels,
    roles,
    processing,
    results,
    sendInitialAlert,
    setSendInitialAlert,
    useNativePlayer,
    setUseNativePlayer,
    customImage,
    setCustomImage,
    isTierEligible,
    handleNext,
    handleBack,
    handleSubmit,
    resetState,
  } = useBulkAddWizard({ guildId, isOpen, onSuccess, tier, isPremium });

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <div className={styles["header-left"]}>
            <div className={styles["icon-wrapper"]}>
              <Zap size={20} />
            </div>
            <div className={styles["header-text"]}>
              <h3 className={styles["modal-title"]}>Bulk Import Wizard</h3>
              <p className={styles["modal-subtitle"]}>
                Step {step} of 3: {step === 1 ? 'Select Platform' : step === 2 ? 'Configure Feeds' : 'Results'}
              </p>
            </div>
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

        <div className={styles["modal-body"]}>
          {guildLoading ? (
            <div className={styles["loading-container"]}>
              <RefreshCw size={48} className={`animate-spin ${styles["loading-spinner"]}`} />
              <p className={styles["loading-text"]}>Verifying permissions...</p>
            </div>
          ) : !isTierEligible ? (
            <div className={styles["lock-container"]}>
              <Shield size={48} className={styles["lock-icon"]} />
              <h4 className={styles["lock-title"]}>Professional Feature</h4>
              <p className={styles["lock-description"]}>
                The Bulk Import Wizard is available exclusively for Professional and Ultimate tiers.
              </p>
              <a href={`/dashboard/${guildId}/billing`} className={styles["upgrade-btn"]}>
                Upgrade to Professional
              </a>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className={styles["platform-grid"]}>
                  {BULK_PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles["platform-card"]} ${selectedPlatform?.id === p.id ? styles["active"] : ''}`}
                      onClick={() => setSelectedPlatform(p)}
                    >
                      <div className={styles["platform-icon-wrapper"]}>
                        <Image 
                          src={p.logo} 
                          alt={p.name} 
                          width={28} 
                          height={28} 
                          unoptimized 
                        />
                      </div>
                      <span className={styles["platform-name"]}>{p.name}</span>
                      {selectedPlatform?.id === p.id && (
                        <div className={styles["platform-check"]}>
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && selectedPlatform && (
                <div>
                  <div className={styles["form-group"]}>
                    <div className={styles["form-label-row"]}>
                      <label className={styles["form-label"]} htmlFor="bulk-source-input">
                        Enter {selectedPlatform.name} sources (one per line)
                      </label>
                      <span className={styles["hint-badge"]}>
                        {selectedPlatform.hint}
                      </span>
                    </div>
                    <textarea
                      id="bulk-source-input"
                      placeholder={selectedPlatform.placeholder}
                      value={inputList}
                      onChange={(e) => setInputList(e.target.value)}
                      className={`ui-input ${styles["bulk-textarea"]}`}
                    />
                  </div>

                  <div className={styles["form-grid-2"]}>
                    <div className={styles["form-group"]}>
                      <span className={styles["form-label"]}>Target Channels</span>
                      <MultiSelect
                        options={channels.map(c => ({ id: c.id, name: `#${c.name}` }))}
                        value={targetChannels}
                        onChange={setTargetChannels}
                        placeholder="Select channels..."
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <span className={styles["form-label"]}>Ping Roles (Optional)</span>
                      <MultiSelect
                        options={roles.map(r => ({ id: r.id, name: r.name }))}
                        value={targetRoles}
                        onChange={setTargetRoles}
                        placeholder="No ping roles"
                      />
                    </div>
                  </div>

                  {supportsCustomEmbedColor(selectedPlatform?.id, useNativePlayer) && (
                    <div className={styles["form-group"]}>
                      <span className={styles["form-label"]}>Accent Color</span>
                      <ColorPicker 
                        value={embedColor} 
                        onChange={setEmbedColor}
                      />
                    </div>
                  )}

                  <div className={styles["section-box"]}>
                    <div className={styles["form-label-row"]}>
                      <label className={styles["form-label"]} htmlFor="bulk-custom-image">
                        Custom Image URL
                      </label>
                      <div className={styles["tag-badge"]}>
                        Imgur, Discord, etc.
                      </div>
                    </div>
                    <input
                      id="bulk-custom-image"
                      type="text"
                      value={customImage}
                      onChange={(e) => setCustomImage(e.target.value)}
                      className="ui-input"
                      placeholder="https://imgur.com/example.png"
                    />
                  </div>

                  {supportsLiveAlerts(selectedPlatform?.id) && (
                    <div className={styles["toggle-row"]}>
                      <div className={styles["toggle-text-wrap"]}>
                        <label className={styles["toggle-label"]} htmlFor="send-initial-alert-bulk">
                          Send initial alert
                        </label>
                        <p className={styles["toggle-desc"]}>
                          Post updates immediately for any source that is already live.
                        </p>
                      </div>
                      <label className="ui-switch">
                        <input
                          id="send-initial-alert-bulk"
                          type="checkbox"
                          checked={sendInitialAlert}
                          onChange={(e) => setSendInitialAlert(e.target.checked)}
                        />
                        <span className="ui-switch-slider"></span>
                      </label>
                    </div>
                  )}

                  {supportsNativePlayer(selectedPlatform?.id) && (
                    <div className={styles["toggle-row"]}>
                      <div className={styles["toggle-text-wrap"]}>
                        <label className={styles["toggle-label"]} htmlFor="use-native-player-bulk">
                          Use Native Discord Player
                        </label>
                        <p className={styles["toggle-desc"]}>
                          Bypass the custom layout and let Discord embed the video directly.
                        </p>
                      </div>
                      <label className="ui-switch">
                        <input
                          id="use-native-player-bulk"
                          type="checkbox"
                          checked={useNativePlayer}
                          onChange={(e) => setUseNativePlayer(e.target.checked)}
                        />
                        <span className="ui-switch-slider"></span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && results && (
                <div className={styles["results-container"]}>
                  <div className={styles["results-icon-box"]}>
                    <Check size={32} />
                  </div>
                  <h4 className={styles["results-title"]}>Import Completed</h4>
                  <p className={styles["results-subtitle"]}>
                    Successfully processed <strong>{results.successCount + results.errorCount}</strong> items.
                  </p>

                  <div className={styles["results-grid"]}>
                    <div className={styles["stat-box"]}>
                      <span className={styles["stat-success-count"]}>{results.successCount}</span>
                      <span className={styles["stat-label"]}>Added Successfully</span>
                    </div>
                    <div className={styles["stat-box"]}>
                      <span className={styles["stat-error-count"]}>{results.errorCount}</span>
                      <span className={styles["stat-label"]}>Failed / Duplicates</span>
                    </div>
                  </div>

                  {results.errors && results.errors.length > 0 && (
                    <div className={styles["issues-box"]}>
                      <span className={styles["issues-label"]}>Issues encountered:</span>
                      <ul className={styles["issues-list"]}>
                        {results.errors.map((err, i) => (
                          <li key={i} className={styles["issue-item"]}>
                            <AlertCircle size={14} className={styles["issue-icon"]} /> {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles["modal-footer"]}>
          {!guildLoading && isTierEligible && step < 3 && (
            <>
              {step > 1 && (
                <button 
                  type="button" 
                  className={`ui-btn ${styles["btn-secondary"]}`} 
                  onClick={handleBack} 
                  disabled={processing}
                >
                  <ChevronLeft size={18} /> Back
                </button>
              )}
              <div className={styles["footer-actions"]}>
                <button 
                  type="button" 
                  className={`ui-btn ${styles["btn-secondary"]}`} 
                  onClick={handleClose} 
                  disabled={processing}
                >
                  Cancel
                </button>
                {step === 1 ? (
                  <button 
                    type="button" 
                    className="ui-btn ui-btn-primary" 
                    onClick={handleNext} 
                    disabled={!selectedPlatform}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="ui-btn ui-btn-primary" 
                    onClick={handleSubmit} 
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={18} /> Create Monitors
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
          {(!isTierEligible || step === 3) && (
            <button 
              type="button" 
              className="ui-btn ui-btn-primary" 
              onClick={handleClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
