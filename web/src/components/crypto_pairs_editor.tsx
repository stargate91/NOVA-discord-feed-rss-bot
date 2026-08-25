import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CryptoPair } from '@/utils/monitor_form';
import styles from './crypto_pairs_editor.module.css';

export interface CryptoPairsEditorProps {
  cryptoPairs: CryptoPair[];
  onUpdatePair: (index: number, field: keyof CryptoPair, value: string) => void;
  onAddPair: () => void;
  onRemovePair: (index: number) => void;
}

export const CryptoPairsEditor: React.FC<CryptoPairsEditorProps> = ({
  cryptoPairs,
  onUpdatePair,
  onAddPair,
  onRemovePair,
}) => {
  return (
    <div className={styles["crypto-container"]}>
      {cryptoPairs.map((pair, idx) => (
        <div key={idx} className={styles["crypto-row"]}>
          <input
            type="text"
            placeholder="BTC"
            value={pair.symbol}
            onChange={(e) => onUpdatePair(idx, 'symbol', e.target.value)}
            className="ui-input"
            required
            aria-label={`Coin symbol ${idx + 1}`}
          />
          <span className={styles["crypto-sep"]}>:</span>
          <input
            type="number"
            placeholder="50000"
            value={pair.threshold}
            onChange={(e) => onUpdatePair(idx, 'threshold', e.target.value)}
            className="ui-input"
            required
            aria-label={`Price threshold ${idx + 1}`}
          />
          {cryptoPairs.length > 1 && (
            <button
              type="button"
              onClick={() => onRemovePair(idx)}
              className={styles["btn-delete-coin"]}
              aria-label={`Remove coin ${idx + 1}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}

      <div className={styles["crypto-actions"]}>
        <button
          type="button"
          onClick={onAddPair}
          className={styles["btn-add-coin"]}
        >
          <Plus size={14} /> Add Another Coin
        </button>
      </div>
    </div>
  );
};

export default CryptoPairsEditor;
