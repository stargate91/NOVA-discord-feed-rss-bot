import type React from 'react';
import type { AccordionProps } from './types';
import { AccordionRoot } from './AccordionRoot';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';

export type * from './types';
export { AccordionRoot } from './AccordionRoot';
export { AccordionItem } from './AccordionItem';
export { AccordionTrigger } from './AccordionTrigger';
export { AccordionContent } from './AccordionContent';

export interface AccordionCompound extends React.FC<AccordionProps> {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
}

export const Accordion = AccordionRoot as AccordionCompound;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
