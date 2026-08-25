"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Hash } from 'lucide-react';
import { PRESET_COLORS, hexToHsv, hsvToHex } from '@/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export default function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const [hsv, setHsv] = useState({ h: 260, s: 70, v: 70 });
  const [isDragging, setIsDragging] = useState<'sv' | 'h' | null>(null);
  const svPanelRef = useRef<HTMLDivElement | null>(null);
  const hueSliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value && /^#[0-9A-F]{3,6}$/i.test(value)) {
      const newHsv = hexToHsv(value);
      setHsv(newHsv);
    }
  }, [value]);

  const updateColor = useCallback((newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    onChange(hex);
  }, [onChange]);

  const handleSvMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svPanelRef.current) return;
    const rect = svPanelRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor({ ...hsv, s: x * 100, v: (1 - y) * 100 });
  }, [hsv, updateColor]);

  const handleHueMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor({ ...hsv, h: x * 360 });
  }, [hsv, updateColor]);

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging === 'sv') handleSvMove(e);
      if (isDragging === 'h') handleHueMove(e);
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

  return (
    <div className={`ui-color-picker ${disabled ? 'disabled' : ''}`} style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      {/* Saturation & Value Square */}
      <div 
        ref={svPanelRef}
        className="ui-color-picker-panel"
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
        onMouseDown={(e) => { !disabled && setIsDragging('sv'); handleSvMove(e); }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, #fff, transparent)' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, #000, transparent)' }}></div>
        <div 
          style={{ position: 'absolute', width: '12px', height: '12px', border: '2px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 5px rgba(0,0,0,0.5)', pointerEvents: 'none', left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
        ></div>
      </div>

      {/* Hue Slider */}
      <div 
        ref={hueSliderRef}
        className="ui-color-picker-slider"
        onMouseDown={(e) => { !disabled && setIsDragging('h'); handleHueMove(e); }}
      >
        <div style={{ position: 'absolute', top: '50%', width: '6px', height: '18px', background: 'white', borderRadius: '3px', transform: 'translate(-50%, -50%)', boxShadow: '0 0 5px rgba(0,0,0,0.5)', pointerEvents: 'none', left: `${(hsv.h / 360) * 100}%` }}></div>
      </div>

      {/* Footer: Hex & Presets */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '10px', gap: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Hash size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input 
            type="text" 
            style={{ background: 'transparent', border: 'none', color: 'white', fontFamily: 'monospace', fontSize: '0.85rem', width: '60px', outline: 'none' }}
            value={value?.replace('#', '') || ''} 
            onChange={(e) => onChange('#' + e.target.value)}
            disabled={disabled}
          />
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: value }}></div>
        </div>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          {PRESET_COLORS.map(c => (
            <div 
              key={c} 
              className="ui-color-picker-dot" 
              style={{ backgroundColor: c }}
              onClick={() => !disabled && onChange(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
