"use client";

import React from 'react';
import MultiSelect from './multi_select';
import { X, AlertCircle, Info } from 'lucide-react';
import ColorPicker from './color_picker';
import { Modal } from '@/components/ui';
import { useBulkEdit } from '@/hooks/use_bulk_edit';
import { GuildFeatures } from '@/types/guild';
import styles from './bulk_edit_modal.module.css';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updateData: Record<string, any>) => Promise<void | boolean>;
  monitorCount: number;
  guildId: string;
}

export default function BulkEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  monitorCount, 
  guildId, 
}: BulkEditModalProps) {
  const {
    formData,
    loading,
    loadingContext,
    guildChannels,
    guildRoles,
    isLocked,
    isImageLocked,
    toggleField,
    updateField,
    handleSubmit,
  } = useBulkEdit(guildId, isOpen, onSave, onClose);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
    >
      <div className={styles["modal-header"]}>
        <div>
          <h3 className={styles["modal-title"]}>Bulk Edit Monitors</h3>
          <p className={styles["modal-subtitle"]}>Updating {monitorCount} selected monitors</p>
        </div>
        <button 
          type="button" 
          className={styles["modal-close-btn"]} 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>

        {isLocked ? (
          <div className={styles["locked-body"]}>
            <div className={styles["locked-icon-box"]}>
              <AlertCircle size={40} />
            </div>
            <h3 className={styles["locked-title"]}>Professional Feature</h3>
            <p className={styles["locked-desc"]}>
              Tidying up many monitors at once is a professional-grade tool. Upgrade your server to unlock bulk editing.
            </p>
            <button 
              type="button" 
              className="ui-btn ui-btn-primary" 
              onClick={onClose}
            >
              I Understand
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles["modal-body-form"]}>
            <div className={styles["info-banner"]}>
              <Info size={20} className={styles["info-icon"]} />
              <p className={styles["info-text"]}>
                Only checked fields will be updated on all <strong>{monitorCount}</strong> monitors. Other settings will remain unchanged.
              </p>
            </div>

            <div className={styles["form-section"]}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-channels"
                  type="checkbox" 
                  checked={formData.use_channels} 
                  onChange={e => toggleField('use_channels', e.target.checked)} 
                  className={styles["checkbox-input"]}
                />
                <label htmlFor="bulk-edit-use-channels" className={styles["section-label"]}>
                  Update Target Channels
                </label>
              </div>
              <div className={`${styles["section-content"]} ${!formData.use_channels ? styles["disabled"] : ''}`}>
                <MultiSelect 
                  options={guildChannels}
                  value={formData.target_channels}
                  onChange={(val: string[]) => updateField('target_channels', val)}
                  placeholder={loadingContext ? "Loading..." : "Select channels"}
                />
              </div>
            </div>

            <div className={styles["form-section"]}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-roles"
                  type="checkbox" 
                  checked={formData.use_roles} 
                  onChange={e => toggleField('use_roles', e.target.checked)} 
                  className={styles["checkbox-input"]}
                />
                <label htmlFor="bulk-edit-use-roles" className={styles["section-label"]}>
                  Update Ping Roles
                </label>
              </div>
              <div className={`${styles["section-content"]} ${!formData.use_roles ? styles["disabled"] : ''}`}>
                <MultiSelect 
                  options={guildRoles}
                  value={formData.target_roles}
                  onChange={(val: string[]) => updateField('target_roles', val)}
                  placeholder={loadingContext ? "Loading..." : "Select roles"}
                />
              </div>
            </div>

            <div className={styles["form-section"]}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-color"
                  type="checkbox" 
                  checked={formData.use_color} 
                  onChange={e => toggleField('use_color', e.target.checked)} 
                  className={styles["checkbox-input"]}
                />
                <label htmlFor="bulk-edit-use-color" className={styles["section-label"]}>
                  Update Embed Color
                </label>
              </div>
              <div className={`${styles["section-content"]} ${!formData.use_color ? styles["disabled"] : ''}`}>
                <ColorPicker 
                  value={formData.embed_color} 
                  onChange={(color: string) => updateField('embed_color', color)}
                />
              </div>
            </div>

            <div className={styles["form-section"]}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-native"
                  type="checkbox" 
                  checked={formData.use_native} 
                  onChange={e => toggleField('use_native', e.target.checked)} 
                  className={styles["checkbox-input"]}
                />
                <label htmlFor="bulk-edit-use-native" className={styles["section-label"]}>
                  Update Native Player
                </label>
              </div>
              <div className={`${styles["section-content"]} ${!formData.use_native ? styles["disabled"] : ''}`}>
                <div className={styles["toggle-box"]}>
                  <div className={styles["toggle-text-wrap"]}>
                    <label htmlFor="bulk-edit-native-toggle" className={styles["toggle-title"]}>
                      Use Native Discord Player
                    </label>
                    <p className={styles["toggle-desc"]}>Only applies to YouTube monitors.</p>
                  </div>
                  <label className="ui-switch">
                    <input 
                      id="bulk-edit-native-toggle"
                      type="checkbox" 
                      checked={formData.use_native_player} 
                      onChange={(e) => updateField('use_native_player', e.target.checked)}
                    />
                    <span className="ui-switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className={`${styles["form-section"]} ${isImageLocked ? styles["disabled-tier"] : ''}`}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-image"
                  type="checkbox" 
                  checked={formData.use_custom_image} 
                  onChange={e => toggleField('use_custom_image', e.target.checked)} 
                  className={styles["checkbox-input"]}
                />
                <label htmlFor="bulk-edit-use-image" className={styles["section-label"]}>
                  Update Custom Image URL
                </label>
              </div>
              <div className={`${styles["section-content"]} ${!formData.use_custom_image ? styles["disabled"] : ''}`}>
                <input 
                  type="text" 
                  className="ui-input" 
                  placeholder="https://imgur.com/example.png"
                  value={formData.custom_image}
                  onChange={(e) => updateField('custom_image', e.target.value)}
                />
              </div>
            </div>

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
                disabled={loading}
              >
                {loading ? 'Updating...' : `Apply to ${monitorCount} Monitors`}
              </button>
            </div>
          </form>
        )}
    </Modal>
  );
}
