import React from 'react';
import type { DiscordEmbedField } from './types';
import styles from './DiscordEmbed.module.css';

interface DiscordEmbedFieldsProps {
  fields?: DiscordEmbedField[];
}

export const DiscordEmbedFields: React.FC<DiscordEmbedFieldsProps> = ({ fields }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <div className={styles.fieldsGrid}>
      {fields.map((field) => (
        <div
          key={`${field.name}-${field.value}`}
          className={`${styles.field} ${field.inline ? '' : styles.fieldFull}`}
        >
          <div className={styles.fieldName}>{field.name}</div>
          <div className={styles.fieldValue}>{field.value}</div>
        </div>
      ))}
    </div>
  );
};
