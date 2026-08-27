import { createContext, useContext } from 'react';
import type { AccordionContextValue, AccordionItemContextValue } from './types';

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export const useAccordion = (): AccordionContextValue => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion subcomponents must be used within an <Accordion>');
  }
  return context;
};

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export const useAccordionItem = (): AccordionItemContextValue => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      'AccordionTrigger and AccordionContent must be used within an <Accordion.Item>'
    );
  }
  return context;
};
