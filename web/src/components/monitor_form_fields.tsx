"use client";

import React from 'react';
import { Info } from 'lucide-react';
import MultiSelect from './multi_select';
import MonitorDeliveryFields from './monitor_delivery_fields';
import MonitorBrandingFields from './monitor_branding_fields';
import MonitorToggleOptions from './monitor_toggle_options';
import { MOVIE_GENRES, LANGUAGES, getAvailableVars } from '@/constants';
import { supportsMediaFilters } from '@/utils';
import { MonitorFormData } from '@/utils/monitor_form';
import { TierFeatureName } from '@/utils/tier_limits';
import styles from './monitor_form_fields.module.css';

export interface MonitorFormFieldsProps {
  platformId: string;
  formData: MonitorFormData;
  onChange: (field: keyof MonitorFormData, value: any) => void;
  guildChannels: Array<{ id: string; name: string }>;
  guildRoles: Array<{ id: string; name: string }>;

  loadingChannelsRoles?: boolean;
  isLocked: (featureName: TierFeatureName) => boolean;
  insertTemplateVariable: (varName: string) => void;
  isSectionPadded?: boolean;
}

export const MonitorFormFields: React.FC<MonitorFormFieldsProps> = ({
  platformId,
  formData,
  onChange,
  guildChannels,
  guildRoles,
  loadingChannelsRoles = false,
  isLocked,
  insertTemplateVariable,
  isSectionPadded = false,
}) => {
  const containerClass = isSectionPadded ? styles["form-section-padded"] : undefined;

  return (
    <>
      {/* ── Advanced Media Filters (Genres & Languages) ── */}
      {supportsMediaFilters(platformId) && (
        <div className={containerClass}>
          <h4 className={styles["section-label-accent"]}>Advanced Filters</h4>
          <div className={`${styles["grid-2"]} ${styles["grid-relative"]}`}>
            <div className={styles["form-group"]}>
              <span className={styles["form-label"]}>Target Genres</span>
              <MultiSelect
                options={MOVIE_GENRES}
                value={formData.target_genres}
                onChange={(val) => onChange('target_genres', val)}
                placeholder={isLocked("genre_filter") ? "Unlock Starter Tier" : "Select genres"}
              />
            </div>
            <div className={styles["form-group"]}>
              <span className={styles["form-label"]}>Languages</span>
              <MultiSelect
                options={LANGUAGES}
                value={formData.target_languages}
                onChange={(val) => onChange('target_languages', val)}
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

      {/* ── Notification Channels & Roles & Template ── */}
      <div className={containerClass}>
        <h4 className={styles["section-label-accent"]}>Notification Settings</h4>
        
        {/* Reusable Channels & Roles */}
        <MonitorDeliveryFields
          guildChannels={guildChannels}
          guildRoles={guildRoles}
          targetChannels={formData.target_channels}
          targetRoles={formData.target_roles}
          onChangeChannels={(val) => onChange('target_channels', val)}
          onChangeRoles={(val) => onChange('target_roles', val)}
          loading={loadingChannelsRoles}
        />

        {/* Custom Alert Message */}
        <div className={styles["custom-alert-box"]}>
          <div className={styles["form-label-row"]}>
            <label htmlFor="monitor-custom-alert" className={styles["form-label"]}>
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
              id="monitor-custom-alert"
              name="custom_alert"
              value={formData.custom_alert}
              onChange={(e) => onChange('custom_alert', e.target.value)}
              className="ui-input ui-textarea"
              placeholder={
                isLocked("alert_template")
                  ? "Unlock Professional Tier to customize messages"
                  : `Leave empty to use default.\nExample: @everyone Here is a new post: {title}`
              }
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
            {getAvailableVars(platformId || '').map((v) => (
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

        {/* Reusable Toggle Options */}
        <MonitorToggleOptions
          platformId={platformId}
          sendInitialAlert={formData.send_initial_alert}
          onChangeSendInitialAlert={(val) => onChange('send_initial_alert', val)}
          useNativePlayer={formData.use_native_player}
          onChangeUseNativePlayer={(val) => onChange('use_native_player', val)}
          includeUpcoming={formData.include_upcoming}
          onChangeIncludeUpcoming={(val) => onChange('include_upcoming', val)}
          isLocked={isLocked}
        />

        {/* Reusable Branding Fields */}
        <MonitorBrandingFields
          platformId={platformId}
          embedColor={formData.embed_color}
          onChangeColor={(color) => onChange('embed_color', color)}
          customImage={formData.custom_image}
          onChangeCustomImage={(url) => onChange('custom_image', url)}
          useNativePlayer={formData.use_native_player}
          isLocked={isLocked}
        />
      </div>
    </>
  );
};

export default MonitorFormFields;

