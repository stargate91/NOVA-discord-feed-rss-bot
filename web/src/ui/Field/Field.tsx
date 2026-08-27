import type { HTMLAttributes, ReactNode } from 'react';
import React, { useId } from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';
import styles from './Field.module.css';

export type FieldLayout = 'vertical' | 'horizontal';

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  tooltip?: ReactNode;
  layout?: FieldLayout;
  htmlFor?: string;
  disabled?: boolean;
  children:
    | ReactNode
    | ((fieldProps: { id: string; isInvalid: boolean; isDisabled: boolean }) => ReactNode);
  className?: string;
  id?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  description,
  hint,
  error,
  required = false,
  optional = false,
  tooltip,
  layout = 'vertical',
  htmlFor,
  disabled = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = htmlFor || id || autoId;
  const helperText = description ?? hint;
  const hasError = Boolean(error);

  const isHorizontal = layout === 'horizontal';

  const fieldClasses = [
    styles.field,
    isHorizontal ? styles.layoutHorizontal : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelElement = label && (
    <div className={styles.labelRow}>
      <div className={styles.labelGroup}>
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
        {tooltip && (
          <span className={styles.tooltipIcon} title={typeof tooltip === 'string' ? tooltip : undefined}>
            <HelpCircle size={14} />
          </span>
        )}
      </div>

      {optional && !required && <span className={styles.optional}>(optional)</span>}
    </div>
  );

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({
        id: fieldId,
        isInvalid: hasError,
        isDisabled: disabled,
      });
    }
    return children;
  };

  return (
    <div id={id} className={fieldClasses} {...rest}>
      {labelElement}

      <div className={styles.controlArea}>
        {renderChildren()}

        {helperText && !hasError && (
          <p className={styles.description} id={`${fieldId}-desc`}>
            {helperText}
          </p>
        )}

        {hasError && (
          <p className={styles.error} id={`${fieldId}-err`} role="alert">
            <AlertCircle size={14} />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
};
