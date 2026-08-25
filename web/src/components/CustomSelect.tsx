"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option...", 
  width = "100%" 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="ui-select-wrapper" style={{ width }} ref={dropdownRef}>
      <div 
        className={`ui-select-box ${isOpen ? 'ui-open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ opacity: !selectedOption ? 0.4 : 1 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} style={{ opacity: 0.4, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div className="ui-select-dropdown">
          {options.map((option) => (
            <div 
              key={option.value} 
              className={`ui-select-item ${value === option.value ? 'ui-selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && (
                <div style={{ width: '6px', height: '6px', background: 'var(--accent-color)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-color)' }}></div>
              )}
            </div>
          ))}
          {options.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No options available</div>}
        </div>
      )}
    </div>
  );
}
