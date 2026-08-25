import React from 'react';
import { Check, X, Zap, Shield, BarChart3, Settings } from 'lucide-react';
import styles from './comparison-table.module.css';

export function PremiumComparisonTable() {
  const tiers = ['Free', 'Starter', 'Professional', 'Ultimate'];

  const categories = [
    {
      name: 'Monitoring Capacity',
      icon: <Zap size={16} />,
      features: [
        { name: 'Max Feed Monitors', values: ['2', '10', '30', '100'] },
        { name: 'Refresh Interval', values: ['20m', '10m', '5m', '2m'], highlight: [3] },
        { name: 'Target Channels', values: ['1', '5', '10', '20'] },
        { name: 'Ping Roles', values: ['1', '5', '10', '20'] },
      ],
    },
    {
      name: 'Management Tools',
      icon: <Settings size={16} />,
      features: [
        { name: 'Live Repost Tool', values: [false, false, true, true], highlight: [2, 3] },
        { name: 'Max Purge Limit', values: ['10', '25', '50', '100'] },
        { name: 'Manual Force Check', values: [true, true, true, true] },
        { name: 'Bulk Basic Actions', values: [false, true, true, true] },
        { name: 'Bulk Settings Edit', values: [false, false, true, true], highlight: [2, 3] },
        { name: 'Bulk Import Wizard', values: [false, false, true, true], highlight: [2, 3] },
      ],
    },
    {
      name: 'Branding & Customization',
      icon: <Shield size={16} />,
      features: [
        { name: 'Remove Branding', values: [false, true, true, true], highlight: [1, 2, 3] },
        { name: 'Custom Templates', values: [false, false, true, true] },
        { name: 'Advanced Filters', values: [false, true, true, true] },
        { name: 'Custom Embed Color', values: [false, true, true, true] },
        { name: 'Native YouTube Player', values: [false, true, true, true] },
      ],
    },
    {
      name: 'Analytics & Logs',
      icon: <BarChart3 size={16} />,
      features: [
        { name: 'Analytics Range', values: ['3d', '7d', '30d', '∞'] },
        { name: 'System Logs', values: [true, true, true, true] },
        { name: 'Export Data', values: [false, false, false, true] },
      ],
    },
  ];

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
        {tiers.map((t, i) => (
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

      {categories.map((cat, catIdx) => (
        <div key={catIdx} className={styles['category-group']}>
          <div className={styles['category-title']}>
            {cat.icon}
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
