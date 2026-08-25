"use client";

import React from 'react';
import { Hash } from 'lucide-react';
import { PRESET_COLORS } from '@/utils';
import { useColorPicker } from '@/hooks/use_color_picker';
import styles from './color_picker.module.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export default function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const {
    hsv,
    currentColorHex,
    ariaValueH,
    ariaValueV,
    svPanelRef,
    hueSliderRef,
    handleSvKeyDown,
    handleHueKeyDown,
    handleSvMouseDown,
    handleHueMouseDown,
    handleHexInputChange,
    handlePresetSelect,
  } = useColorPicker({ value, onChange, disabled });

  return (
    <div className={`${styles["color-picker"]} ${disabled ? styles["disabled"] : ''}`}>
      {/* Saturation & Value Square */}
      <div 
        ref={svPanelRef}
        className={styles["sv-panel-wrap"]}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-label="Color saturation and brightness"
        aria-valuenow={ariaValueV}
        onKeyDown={handleSvKeyDown}
        onMouseDown={handleSvMouseDown}
      >
        <svg className={styles["sv-svg"]} preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="sat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor={`hsl(${hsv.h}, 100%, 50%)`} />
            </linearGradient>
            <linearGradient id="val-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#sat-grad)" />
          <rect width="100" height="100" fill="url(#val-grad)" />
          <circle 
            cx={hsv.s} 
            cy={100 - hsv.v} 
            r="4" 
            className={styles["sv-handle"]} 
          />
        </svg>
      </div>

      {/* Hue Slider */}
      <div 
        ref={hueSliderRef}
        className={styles["hue-slider-wrap"]}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-label="Color hue slider"
        aria-valuenow={ariaValueH}
        aria-valuemin={0}
        aria-valuemax={360}
        onKeyDown={handleHueKeyDown}
        onMouseDown={handleHueMouseDown}
      >
        <svg className={styles["hue-svg"]} preserveAspectRatio="none" viewBox="0 0 360 20">
          <circle 
            cx={hsv.h} 
            cy="10" 
            r="7" 
            className={styles["hue-handle"]} 
          />
        </svg>
      </div>

      {/* Footer: Hex & Presets */}
      <div className={styles["picker-footer"]}>
        <div className={styles["hex-input-wrap"]}>
          <Hash size={14} className={styles["hash-icon"]} />
          <input 
            type="text" 
            className={styles["hex-input"]}
            value={value?.replace('#', '') || ''} 
            onChange={(e) => handleHexInputChange(e.target.value)}
            disabled={disabled}
            aria-label="Hex color value"
          />
          <svg width="16" height="16" className={styles["color-swatch"]}>
            <rect width="16" height="16" rx="4" fill={currentColorHex} />
          </svg>
        </div>
        
        <div className={styles["preset-group"]}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={styles["preset-btn"]}
              onClick={() => handlePresetSelect(c)}
              aria-label={`Select color ${c}`}
            >
              <svg width="18" height="18">
                <circle cx="9" cy="9" r="8" fill={c} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
