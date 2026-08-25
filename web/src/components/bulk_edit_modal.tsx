"use client";

import React, { useState, useEffect } from 'react';
import MultiSelect from './multi_select';
import { X, AlertCircle, Info } from 'lucide-react';
import { useToast } from "@/context/toast_context";
import { useSession } from 'next-auth/react';
import ColorPicker from './color_picker';
import guildService from '@/services/guild_service';
import styles from './bulk_edit_modal.module.css';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updateData: Record<string, any>) => Promise<void>;
  monitorCount: number;
  guildId: string;
  tier?: number;
  isPremium?: boolean;
}

export default function BulkEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  monitorCount, 
  guildId, 
  tier = 0, 
  isPremium = false 
}: BulkEditModalProps) {
  const { addToast } = useToast();
  const { data: session } = useSession();
  const isMasterUser = (session?.user as any)?.role === 'master';
  const [loading, setLoading] = useState(false);
  const [guildChannels, setGuildChannels] = useState<any[]>([]);
  const [guildRoles, setGuildRoles] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);
  
  const [formData, setFormData] = useState({
    target_channels: [] as string[],
    target_roles: [] as string[],
    embed_color: '#3d3f45',
    use_channels: false,
    use_roles: false,
    use_color: false,
    use_native: false,
    use_native_player: false,
    use_custom_image: false,
    custom_image: ''
  });

  const isLocked = !isMasterUser && !isPremium && tier < 2;

  useEffect(() => {
    if (!isOpen || !guildId) return;
    let ignore = false;

    async function loadData() {
      try {
        const [channels, roles] = await Promise.all([
          guildService.getChannels(guildId),
          guildService.getRoles(guildId)
        ]);
        if (!ignore) {
          setGuildChannels(channels);
          setGuildRoles(roles);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setLoadingContext(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [isOpen, guildId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      addToast("Bulk editing requires Professional Tier (Tier 2) or higher.", "error", "Locked");
      return;
    }

    const updateData: Record<string, any> = {};
    if (formData.use_channels) updateData.target_channels = formData.target_channels;
    if (formData.use_roles) updateData.target_roles = formData.target_roles;
    if (formData.use_color) updateData.embed_color = formData.embed_color;
    if (formData.use_native) updateData.use_native_player = formData.use_native_player;
    if (formData.use_custom_image) updateData.custom_image = formData.custom_image;

    if (Object.keys(updateData).length === 0) {
      addToast("Please select at least one field to update.", "info", "No changes");
      return;
    }

    setLoading(true);
    await onSave(updateData);
    setLoading(false);
    onClose();
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
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
                  onChange={e => setFormData(prev => ({ ...prev, use_channels: e.target.checked }))} 
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
                  onChange={(val: string[]) => setFormData(prev => ({ ...prev, target_channels: val }))}
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
                  onChange={e => setFormData(prev => ({ ...prev, use_roles: e.target.checked }))} 
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
                  onChange={(val: string[]) => setFormData(prev => ({ ...prev, target_roles: val }))}
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
                  onChange={e => setFormData(prev => ({ ...prev, use_color: e.target.checked }))} 
                  className={styles["checkbox-input"]}
                />
                <label htmlFor="bulk-edit-use-color" className={styles["section-label"]}>
                  Update Embed Color
                </label>
              </div>
              <div className={`${styles["section-content"]} ${!formData.use_color ? styles["disabled"] : ''}`}>
                <ColorPicker 
                  value={formData.embed_color} 
                  onChange={(color: string) => setFormData(prev => ({ ...prev, embed_color: color }))}
                />
              </div>
            </div>

            <div className={styles["form-section"]}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-native"
                  type="checkbox" 
                  checked={formData.use_native} 
                  onChange={e => setFormData(prev => ({ ...prev, use_native: e.target.checked }))} 
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
                      onChange={(e) => setFormData(prev => ({ ...prev, use_native_player: e.target.checked }))}
                    />
                    <span className="ui-switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className={`${styles["form-section"]} ${!(isPremium || tier >= 2) ? styles["disabled-tier"] : ''}`}>
              <div className={styles["checkbox-header"]}>
                <input 
                  id="bulk-edit-use-image"
                  type="checkbox" 
                  checked={formData.use_custom_image} 
                  onChange={e => setFormData(prev => ({ ...prev, use_custom_image: e.target.checked }))} 
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
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_image: e.target.value }))}
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
      </div>
    </div>
  );
}
