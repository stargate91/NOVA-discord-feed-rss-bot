import React, { useState, useRef, useCallback, useEffect } from 'react';
import { hexToHsv, hsvToHex } from '@/utils/color';

export interface UseColorPickerOptions {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function useColorPicker({ value, onChange, disabled = false }: UseColorPickerOptions) {
  const [prevValue, setPrevValue] = useState(value);
  const [hsv, setHsv] = useState(() =>
    value && /^#[0-9A-F]{3,6}$/i.test(value) ? hexToHsv(value) : { h: 260, s: 70, v: 70 }
  );
  const [isDragging, setIsDragging] = useState<'sv' | 'h' | null>(null);
  const svPanelRef = useRef<HTMLDivElement | null>(null);
  const hueSliderRef = useRef<HTMLDivElement | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value && /^#[0-9A-F]{3,6}$/i.test(value)) {
      setHsv(hexToHsv(value));
    }
  }

  const updateColor = useCallback(
    (newHsv: { h: number; s: number; v: number }) => {
      setHsv(newHsv);
      const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
      onChange(hex);
    },
    [onChange]
  );

  const handleSvMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!svPanelRef.current) return;
      const rect = svPanelRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      updateColor({ ...hsv, s: x * 100, v: (1 - y) * 100 });
    },
    [hsv, updateColor]
  );

  const handleHueMove = useCallback(
    (clientX: number) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      updateColor({ ...hsv, h: x * 360 });
    },
    [hsv, updateColor]
  );

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

  const handleSvMouseDown = (e: React.MouseEvent) => {
    if (!disabled) {
      setIsDragging('sv');
      handleSvMove(e.clientX, e.clientY);
    }
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    if (!disabled) {
      setIsDragging('h');
      handleHueMove(e.clientX);
    }
  };

  const handleHexInputChange = (rawHex: string) => {
    const cleanHex = rawHex.replace(/^#/, '');
    onChange(`#${cleanHex}`);
  };

  const handlePresetSelect = (presetColor: string) => {
    if (!disabled) {
      onChange(presetColor);
    }
  };

  const currentColorHex = value || '#3d3f45';
  const ariaValueH = Math.round(hsv.h);
  const ariaValueV = Math.round(hsv.v);

  return {
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
  };
}
