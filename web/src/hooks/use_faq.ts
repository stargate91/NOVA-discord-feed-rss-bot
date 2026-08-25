import { useState, useMemo } from 'react';
import { FAQ_CATEGORIES, FAQCategoryItem } from '@/constants/faq';

export function useFaq(categories: FAQCategoryItem[] = FAQ_CATEGORIES) {
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.category || ''
  );
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const currentCategoryData = useMemo(() => {
    return categories.find((c) => c.category === activeCategory) || categories[0];
  }, [categories, activeCategory]);

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    setOpenItems({});
  };

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isItemOpen = (index: number) => Boolean(openItems[index]);

  return {
    categories,
    activeCategory,
    currentCategoryData,
    handleCategorySelect,
    toggleItem,
    isItemOpen,
  };
}
