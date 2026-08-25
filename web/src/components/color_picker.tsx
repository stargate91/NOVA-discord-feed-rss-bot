"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { PRESET_COLORS, hexToHsv, hsvToHex } from '@/utils';
import styles from './color_picker.module.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export default function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [hsv, setHsv] = useState(() => (value && /^#[0-9A-F]{3,6}$/i.test(value) ? hexToHsv(value) : { h: 260, s: 70, v: 70 }));
  const [isDragging, setIsDragging] = useState<'sv' | 'h' | null>(null);
  const svPanelRef = useRef<HTMLDivElement | null>(null);
  const hueSliderRef = useRef<HTMLDivElement | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value && /^#[0-9A-F]{3,6}$/i.test(value)) {
      setHsv(hexToHsv(value));
    }
  }

  const updateColor = useCallback((newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    onChange(hex);
  }, [onChange]);

  const handleSvMove = useCallback((clientX: number, clientY: number) => {
    if (!svPanelRef.current) return;
    const rect = svPanelRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    updateColor({ ...hsv, s: x * 100, v: (1 - y) * 100 });
  }, [hsv, updateColor]);

  const handleHueMove = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    updateColor({ ...hsv, h: x * 360 });
  }, [hsv, updateColor]);

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging === 'sv') handleSvMove(e.clientX, e.clientY);
      if (isDragging === 'h') handleHueMove(e.clientX);
    };
    const handleGlobalUp = () => setIsDragging(null);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging, handleSvMove, handleHueMove]);

  const handleSvKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let newS = hsv.s;
    let newV = hsv.v;
    if (e.key === 'ArrowRight') newS = Math.min(100, newS + 2);
    if (e.key === 'ArrowLeft') newS = Math.max(0, newS - 2);
    if (e.key === 'ArrowUp') newV = Math.min(100, newV + 2);
    if (e.key === 'ArrowDown') newV = Math.max(0, newV - 2);
    if (newS !== hsv.s || newV !== hsv.v) {
      e.preventDefault();
      updateColor({ ...hsv, s: newS, v: newV });
    }
  };

  const handleHueKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let newH = hsv.h;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') newH = (newH + 5) % 360;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') newH = (newH - 5 + 360) % 360;
    if (newH !== hsv.h) {
      e.preventDefault();
      updateColor({ ...hsv, h: newH });
    }
  };

  const currentColorHex = value || '#3d3f45';

  return (
    <div className={`${styles["color-picker"]} ${disabled ? styles["disabled"] : ''}`}>
      {/* Saturation & Value Square */}
      <div 
        ref={svPanelRef}
        className={styles["sv-panel-wrap"]}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-label="Color saturation and brightness"
        aria-valuenow={Math.round(hsv.v)}
        onKeyDown={handleSvKeyDown}
        onMouseDown={(e) => { 
          if (!disabled) {
            setIsDragging('sv'); 
            handleSvMove(e.clientX, e.clientY); 
          }
        }}
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
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={360}
        onKeyDown={handleHueKeyDown}
        onMouseDown={(e) => { 
          if (!disabled) {
            setIsDragging('h'); 
            handleHueMove(e.clientX); 
          }
        }}
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
            onChange={(e) => onChange('#' + e.target.value)}
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
              onClick={() => !disabled && onChange(c)}
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
