import type React from 'react';
import type { AccordionProps } from './types';
import { AccordionRoot } from './AccordionRoot';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';

export * from './types';
export * from './context';
export * from './AccordionRoot';
export * from './AccordionItem';
export * from './AccordionTrigger';
export * from './AccordionContent';

export interface AccordionCompound extends React.FC<AccordionProps> {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
}

export const Accordion = AccordionRoot as AccordionCompound;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
