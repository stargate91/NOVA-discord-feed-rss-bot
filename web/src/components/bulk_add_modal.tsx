"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Check, AlertCircle, ChevronRight, ChevronLeft, RefreshCw, Shield } from "lucide-react";
import MonitorDeliveryFields from './monitor_delivery_fields';
import MonitorBrandingFields from './monitor_branding_fields';
import MonitorToggleOptions from './monitor_toggle_options';
import { Modal, Button } from '@/components/ui';
import { BULK_PLATFORMS } from '@/constants/platforms';
import { getGuildDashboardRoute } from '@/utils';
import { useBulkAddWizard } from '@/hooks/use_bulk_add_wizard';
import { useGuildContext } from '@/context/guild_context';
import styles from './bulk_add_modal.module.css';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  guildId: string;
  onSuccess?: () => void;
}

export default function BulkAddModal({ 
  isOpen, 
  onClose, 
  guildId, 
  onSuccess, 
}: BulkAddModalProps) {
  const { loading: guildLoading, isLocked } = useGuildContext();
  const {
    step,
    selectedPlatform,
    formData,
    updateField,
    handleColorChange,
    handlePlatformSelect,
    channelOptions,
    roleOptions,
    processing,
    results,
    isTierEligible,
    handleNext,
    handleBack,
    handleSubmit,
    resetState,
  } = useBulkAddWizard({
    guildId,
    isOpen,
    onSuccess,
  });

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const isFormValid = formData.sources_input.trim().length > 0 && formData.target_channels.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        <div className={styles["header-left"]}>
          <div className={styles["header-icon"]}>
            <Zap size={20} />
          </div>
          <div>
            <h3 className={styles["header-title"]}>Bulk Add Monitors</h3>
            <p className={styles["header-subtitle"]}>Quickly set up multiple sources at once</p>
          </div>
        </div>
      }
      size="md"
      className={styles["bulk-modal-custom"]}
    >
      <div className={styles["modal-shell"]}>
        {/* Tier Lock Gate */}
        {!isTierEligible && !guildLoading ? (
          <div className={styles["tier-gate"]}>
            <div className={styles["gate-icon-wrap"]}>
              <Shield size={36} className={styles["gate-icon"]} />
            </div>
            <h4 className={styles["gate-title"]}>Professional Tier Feature</h4>
            <p className={styles["gate-desc"]}>
              The Bulk Add Wizard allows you to quickly import multiple social media and streaming feeds in one go. Upgrade your server to unlock this power feature.
            </p>
            <div className={styles["gate-actions"]}>
              <Link 
                href={getGuildDashboardRoute(guildId, 'billing')}
                className={`ui-btn ui-btn-primary ${styles["gate-upgrade-btn"]}`}
              >
                Upgrade to Professional
              </Link>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleModalClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stepper Wizard Indicator */}
            <div className={styles["wizard-stepper"]}>
              <div className={`${styles["step-item"]} ${step >= 1 ? styles["active"] : ''}`}>
                <div className={styles["step-number"]}>1</div>
                <span className={styles["step-text"]}>Select Platform</span>
              </div>
              <div className={styles["step-line"]} />
              <div className={`${styles["step-item"]} ${step >= 2 ? styles["active"] : ''}`}>
                <div className={styles["step-number"]}>2</div>
                <span className={styles["step-text"]}>Configure</span>
              </div>
              <div className={styles["step-line"]} />
              <div className={`${styles["step-item"]} ${step >= 3 ? styles["active"] : ''}`}>
                <div className={styles["step-number"]}>3</div>
                <span className={styles["step-text"]}>Results</span>
              </div>
            </div>

            {/* Modal Body / Steps */}
            <div className={styles["modal-body-custom"]}>
              {step === 1 && (
                <div className={styles["platforms-grid"]}>
                  {BULK_PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePlatformSelect(p)}
                      className={`${styles["platform-card"]} ${selectedPlatform?.id === p.id ? styles["selected"] : ''}`}
                    >
                      <div className={styles["platform-card-header"]}>
                        <div className={styles["platform-icon-wrap"]}>
                          <Image src={p.logo} alt={p.name} width={28} height={28} className={styles["platform-icon"]} unoptimized />
                        </div>
                        <span className={styles["platform-name"]}>{p.name}</span>
                      </div>
                      <p className={styles["platform-desc"]}>{p.hint}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && selectedPlatform && (
                <div className={styles["config-form"]}>
                  <div className={styles["form-group"]}>
                    <div className={styles["form-label-row"]}>
                      <label className={styles["form-label"]} htmlFor="bulk-source-input">
                        Sources (One per line)
                      </label>
                      <span className={styles["hint-badge"]}>
                        {selectedPlatform.hint}
                      </span>
                    </div>
                    <textarea
                      id="bulk-source-input"
                      placeholder={selectedPlatform.placeholder}
                      value={formData.sources_input}
                      onChange={(e) => updateField('sources_input', e.target.value)}
                      className={`ui-input ${styles["bulk-textarea"]}`}
                    />
                  </div>

                  <MonitorDeliveryFields
                    guildChannels={channelOptions}
                    guildRoles={roleOptions}
                    targetChannels={formData.target_channels}
                    targetRoles={formData.target_roles}
                    onChangeChannels={(val) => updateField('target_channels', val)}
                    onChangeRoles={(val) => updateField('target_roles', val)}
                    className={styles["form-grid-2"]}
                  />

                  <MonitorBrandingFields
                    platformId={selectedPlatform.id}
                    embedColor={formData.embed_color}
                    onChangeColor={handleColorChange}
                    customImage={formData.custom_image}
                    onChangeCustomImage={(url) => updateField('custom_image', url)}
                    useNativePlayer={formData.use_native_player}
                    isLocked={isLocked}
                  />

                  <MonitorToggleOptions
                    platformId={selectedPlatform.id}
                    sendInitialAlert={formData.send_initial_alert}
                    onChangeSendInitialAlert={(val) => updateField('send_initial_alert', val)}
                    useNativePlayer={formData.use_native_player}
                    onChangeUseNativePlayer={(val) => updateField('use_native_player', val)}
                    isLocked={isLocked}
                  />
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
            </div>
          </>
        )}

        <div className={styles["modal-footer"]}>
          {!guildLoading && isTierEligible && step < 3 && (
            <>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleBack} 
                  disabled={processing}
                  leftIcon={<ChevronLeft size={18} />}
                >
                  Back
                </Button>
              )}
              <div className={styles["footer-actions"]}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleModalClose} 
                  disabled={processing}
                >
                  Cancel
                </Button>
                {step === 1 ? (
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={handleNext} 
                    disabled={!selectedPlatform}
                    rightIcon={<ChevronRight size={18} />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={handleSubmit} 
                    isLoading={processing}
                    disabled={!isFormValid}
                    leftIcon={!processing ? <Zap size={18} /> : undefined}
                  >
                    Create Monitors
                  </Button>
                )}
              </div>
            </>
          )}
          {(!isTierEligible || step === 3) && (
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleModalClose}
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

