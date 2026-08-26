"use client";

import React from 'react';
import Image from 'next/image';
import { Info } from 'lucide-react';
import CryptoPairsEditor from './crypto_pairs_editor';
import MonitorFormFields from './monitor_form_fields';
import { Modal } from '@/components/ui';
import { MonitorConfig, UpdateMonitorPayload } from '@/types/monitor';
import { getPlatformLogo, isCryptoPlatform } from '@/utils';
import { useEditMonitor } from '@/hooks/use_edit_monitor';
import styles from './edit_monitor_modal.module.css';

interface EditMonitorModalProps {
  monitor: MonitorConfig | null;
  guildId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updateData: UpdateMonitorPayload) => Promise<boolean | void>;
}

export default function EditMonitorModal({ 
  monitor, 
  guildId, 
  isOpen, 
  onClose, 
  onSave, 
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
  });

  if (!isOpen || !monitor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className={styles["header-row"]}>
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
              {monitor.name}{' '}
              <span className={styles["type-pill"]}>{monitor.type}</span>
            </p>
          </div>
        </div>
      }
    >


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

            <CryptoPairsEditor
              cryptoPairs={cryptoPairs}
              onUpdatePair={updateCryptoPair}
              onAddPair={addCryptoPair}
              onRemovePair={removeCryptoPair}
            />
          </div>
        )}

        {/* ── Centralized Common Form Fields ── */}
        <MonitorFormFields
          platformId={monitor.type}
          formData={formData}
          onChange={handleMultiChange}
          guildChannels={guildChannels}
          guildRoles={guildRoles}
          loadingChannelsRoles={loadingData}
          isLocked={isLocked}
          insertTemplateVariable={insertTemplateVariable}
        />

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
    </Modal>
  );
}

