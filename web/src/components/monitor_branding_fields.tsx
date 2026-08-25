"use client";

import React from 'react';
import { Info } from 'lucide-react';
import ColorPicker from './color_picker';
import { supportsCustomEmbedColor } from '@/utils';
import { TierFeatureName } from '@/utils/tier_limits';
import styles from './monitor_form_fields.module.css';

export interface MonitorBrandingFieldsProps {
  platformId?: string;
  embedColor?: string;
  onChangeColor?: (color: string) => void;
  customImage?: string;
  onChangeCustomImage?: (url: string) => void;
  useNativePlayer?: boolean;
  isLocked?: (featureName: TierFeatureName) => boolean;
  disabledColor?: boolean;
  disabledImage?: boolean;
}

export const MonitorBrandingFields: React.FC<MonitorBrandingFieldsProps> = ({
  platformId = '',
  embedColor = '#3d3f45',
  onChangeColor,
  customImage = '',
  onChangeCustomImage,
  useNativePlayer = false,
  isLocked = () => false,
  disabledColor = false,
  disabledImage = false,
}) => {
  const colorLocked = isLocked('custom_color');
  const imageLocked = isLocked('custom_color');

  return (
    <>
      {/* Embed Accent Color */}
      {supportsCustomEmbedColor(platformId, useNativePlayer) && (
        <div className={styles["form-group"]}>
          <div className={styles["form-label-row"]}>
            <span className={styles["form-label"]}>Embed Color</span>
            {colorLocked && (
              <div className={styles["hint-badge"]}>
                <Info size={12} /> Starter Tier+
              </div>
            )}
          </div>
          <ColorPicker
            value={embedColor}
            onChange={(color) => !colorLocked && !disabledColor && onChangeColor?.(color)}
            disabled={colorLocked || disabledColor}
          />
        </div>
      )}

      {/* Custom Image URL */}
      <div className={styles["custom-alert-box"]}>
        <div className={styles["form-label-row"]}>
          <label htmlFor="monitor-custom-image" className={styles["form-label"]}>
            Custom Image URL
          </label>
          {imageLocked ? (
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
            id="monitor-custom-image"
            type="text"
            name="custom_image"
            value={customImage}
            onChange={(e) => !imageLocked && !disabledImage && onChangeCustomImage?.(e.target.value)}
            className="ui-input"
            placeholder={
              imageLocked
                ? "Unlock Starter Tier to use custom images"
                : "https://imgur.com/example.png"
            }
            disabled={imageLocked || disabledImage}
          />
          {imageLocked && (
            <div className={styles["locked-overlay"]}>
              <span className={styles["locked-badge"]}>Starter Tier+</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MonitorBrandingFields;
