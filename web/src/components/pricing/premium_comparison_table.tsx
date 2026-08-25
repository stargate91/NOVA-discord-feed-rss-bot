import React from 'react';
import { Check, X, Zap, Shield, BarChart3, Settings } from 'lucide-react';
import {
  COMPARISON_TIERS,
  COMPARISON_CATEGORIES,
} from '@/constants/tiers';
import styles from './premium_comparison_table.module.css';

const CATEGORY_ICONS = {
  Zap: <Zap size={16} />,
  Settings: <Settings size={16} />,
  Shield: <Shield size={16} />,
  BarChart3: <BarChart3 size={16} />,
};

export function PremiumComparisonTable() {


  const renderValue = (val: string | boolean, isHighlighted?: boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check
          size={18}
          className={[
            styles['icon-check'],
            isHighlighted && styles.highlighted,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ) : (
        <X size={18} className={styles['icon-x']} />
      );
    }
    return (
      <span className={isHighlighted ? styles.highlighted : undefined}>
        {val}
      </span>
    );
  };

  return (
    <div className={styles['comparison-container']}>
      <div className={styles['table-header-row']}>
        <div className={styles['feature-col-title']}>Features</div>
        {COMPARISON_TIERS.map((t, i) => (
          <div
            key={i}
            className={[
              styles['tier-col-title'],
              i === 3 && styles.ultimate,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {t}
          </div>
        ))}
      </div>

      {COMPARISON_CATEGORIES.map((cat, catIdx) => (
        <div key={catIdx} className={styles['category-group']}>
          <div className={styles['category-title']}>
            {CATEGORY_ICONS[cat.iconName]}
            <span>{cat.name}</span>
          </div>
          {cat.features.map((feat, featIdx) => (
            <div key={featIdx} className={styles['feature-row']}>
              <div className={styles['feature-name']}>{feat.name}</div>
              {feat.values.map((val, valIdx) => (
                <div
                  key={valIdx}
                  className={[
                    styles['value-cell'],
                    feat.highlight?.includes(valIdx) && styles.highlighted,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {renderValue(val, feat.highlight?.includes(valIdx))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
