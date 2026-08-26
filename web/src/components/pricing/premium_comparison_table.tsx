import React from 'react';
import { Check, X, Zap, Shield, BarChart3, Settings } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import {
  COMPARISON_TIERS,
  COMPARISON_CATEGORIES,
} from '@/constants/tiers';
import { parseComparisonCellValue } from '@/utils';
import styles from './premium_comparison_table.module.css';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap size={16} />,
  Settings: <Settings size={16} />,
  Shield: <Shield size={16} />,
  BarChart3: <BarChart3 size={16} />,
};

interface ComparisonCellProps {
  value: string | boolean;
  isHighlighted?: boolean;
}

function ComparisonCell({ value, isHighlighted }: ComparisonCellProps) {
  const cell = parseComparisonCellValue(value, isHighlighted);

  if (cell.type === 'boolean') {
    return cell.booleanValue ? (
      <Check
        size={18}
        className={[
          styles['icon-check'],
          cell.isHighlighted && styles.highlighted,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    ) : (
      <X size={18} className={styles['icon-x']} />
    );
  }

  return (
    <span className={cell.isHighlighted ? styles.highlighted : undefined}>
      {cell.textValue}
    </span>
  );
}

export function PremiumComparisonTable() {
  return (
    <div className={styles['comparison-container']}>
      <Table striped size="md" className={styles['comparison-table']}>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead className={styles['feature-col-title']}>Features</TableHead>
            {COMPARISON_TIERS.map((t, i) => (
              <TableHead
                key={i}
                className={[
                  styles['tier-col-title'],
                  i === 3 && styles.ultimate,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {t}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {COMPARISON_CATEGORIES.map((cat, catIdx) => (
            <React.Fragment key={catIdx}>
              <TableRow hoverable={false} className={styles['category-row']}>
                <TableCell
                  colSpan={COMPARISON_TIERS.length + 1}
                  className={styles['category-title-cell']}
                >
                  <div className={styles['category-title']}>
                    {CATEGORY_ICONS[cat.iconName]}
                    <span>{cat.name}</span>
                  </div>
                </TableCell>
              </TableRow>

              {cat.features.map((feat, featIdx) => (
                <TableRow key={featIdx}>
                  <TableCell className={styles['feature-name']}>{feat.name}</TableCell>
                  {feat.values.map((val, valIdx) => (
                    <TableCell
                      key={valIdx}
                      className={[
                        styles['value-cell'],
                        feat.highlight?.includes(valIdx) && styles.highlighted,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <ComparisonCell
                        value={val}
                        isHighlighted={feat.highlight?.includes(valIdx)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
