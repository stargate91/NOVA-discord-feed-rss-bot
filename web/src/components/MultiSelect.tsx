"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';

interface MultiSelectOption {
  id?: string;
  name?: string;
  [key: string]: any;
}

interface MultiSelectProps {
  options?: Array<MultiSelectOption | string>;
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options..." 
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getItemId = (opt: MultiSelectOption | string): string => {
    if (typeof opt === 'string') return opt;
    return String(opt.id || opt.value || opt.name || '');
  };

  const getItemName = (opt: MultiSelectOption | string): string => {
    if (typeof opt === 'string') return opt;
    return String(opt.name || opt.label || opt.id || '');
  };

  const selectedItems = options.filter(opt => value.includes(getItemId(opt)));
  const filteredOptions = options.filter(opt => 
    getItemName(opt).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    const newValue = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const removeTag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className="ui-select-wrapper" ref={dropdownRef}>
      <div 
        className={`ui-select-box ${isOpen ? 'ui-open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ height: 'auto' }}
      >
        <div className="ui-tag-list">
          {selectedItems.length > 0 ? (
            selectedItems.map(item => {
              const id = getItemId(item);
              const name = getItemName(item);
              return (
                <div key={id} className="ui-tag">
                  <span>{name}</span>
                  <X 
                    size={14} 
                    className="ui-tag-remove" 
                    onClick={(e) => removeTag(e, id)} 
                  />
                </div>
              );
            })
          ) : (
            <span style={{ opacity: 0.3, fontSize: '0.95rem' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} style={{ opacity: 0.3, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <div className="ui-select-dropdown">
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Search size={16} style={{ opacity: 0.3 }} />
            <input 
              type="text" 
              style={{ flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem' }}
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '8px' }}>
            {filteredOptions.map(option => {
              const id = getItemId(option);
              const name = getItemName(option);
              const isSelected = value.includes(id);
              return (
                <div 
                  key={id} 
                  className={`ui-select-item ${isSelected ? 'ui-selected' : ''}`}
                  onClick={() => toggleOption(id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '4px', 
                      border: '1.5px solid rgba(255, 255, 255, 0.2)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      transition: 'all 0.2s',
                      background: isSelected ? 'var(--accent-color)' : 'transparent',
                      borderColor: isSelected ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.2)'
                    }}>
                      {isSelected && <Check size={12} color="white" />}
                    </div>
                    <span style={{ fontSize: '0.95rem' }}>{name}</span>
                  </div>
                </div>
              );
            })}
            {filteredOptions.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.9rem' }}>No matches found</div>
            )}
          </div>

          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
             <span>{value.length} selected</span>
             <button style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600, marginLeft: 'auto' }} onClick={() => onChange([])}>Clear All</button>
          </div>
        </div>
      )}
    </div>
  );
}
