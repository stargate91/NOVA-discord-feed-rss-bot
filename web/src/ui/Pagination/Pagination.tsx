import type { HTMLAttributes } from 'react';
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
  id?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = false,
  className = '',
  id,
  ...rest
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return [];
  };

  const pages = generatePageNumbers();

  return (
    <nav
      id={id}
      role="navigation"
      aria-label="Pagination Navigation"
      className={`${styles.pagination} ${className}`}
      {...rest}
    >
      {showFirstLast && (
        <button
          type="button"
          aria-label="Go to first page"
          disabled={page === 1}
          className={styles.btn}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft size={14} />
        </button>
      )}

      <button
        type="button"
        aria-label="Go to previous page"
        disabled={page === 1}
        className={styles.btn}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, index) => {
        if (p === '...') {
          const prev = pages[index - 1];
          const next = pages[index + 1];
          return (
            <span key={`dots-between-${prev}-${next}`} className={styles.ellipsis}>
              …
            </span>
          );
        }

        const isCurrent = p === page;

        return (
          <button
            key={`page-${p}`}
            type="button"
            aria-current={isCurrent ? 'page' : undefined}
            className={`${styles.btn} ${isCurrent ? styles.active : ''}`}
            onClick={() => onPageChange(Number(p))}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Go to next page"
        disabled={page === totalPages}
        className={styles.btn}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={14} />
      </button>

      {showFirstLast && (
        <button
          type="button"
          aria-label="Go to last page"
          disabled={page === totalPages}
          className={styles.btn}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight size={14} />
        </button>
      )}
    </nav>
  );
};
