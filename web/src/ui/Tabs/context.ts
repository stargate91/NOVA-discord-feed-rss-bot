import { createContext, useContext } from 'react';
import type { TabsContextValue } from './types';

export const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabs = (): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs subcomponents must be used within a <Tabs>');
  }
  return context;
};
