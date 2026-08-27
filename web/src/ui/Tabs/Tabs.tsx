import type React from 'react';
import type { TabsProps } from './types';
import { TabsRoot } from './TabsRoot';
import { TabsList } from './TabsList';
import { Tab } from './Tab';
import { TabPanel } from './TabPanel';

export type * from './types';
export { TabsRoot } from './TabsRoot';
export { TabsList } from './TabsList';
export { Tab } from './Tab';
export { TabPanel } from './TabPanel';

export interface TabsCompound extends React.FC<TabsProps> {
  List: typeof TabsList;
  Tab: typeof Tab;
  Trigger: typeof Tab;
  Panel: typeof TabPanel;
  Content: typeof TabPanel;
}

export const Tabs = TabsRoot as TabsCompound;
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Trigger = Tab;
Tabs.Panel = TabPanel;
Tabs.Content = TabPanel;
