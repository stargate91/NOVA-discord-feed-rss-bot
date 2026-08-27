import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useTheme } from './useTheme';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={`${styles.toggleBtn} ${className}`}
      onClick={toggleTheme}
      aria-label={t('common.themeToggle')}
      title={isDark ? t('common.themeLight') : t('common.themeDark')}
    >
      <span className={styles.iconWrapper}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</span>
    </button>
  );
};
