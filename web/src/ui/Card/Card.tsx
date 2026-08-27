import type React from 'react';
import type { CardProps } from './types';
import { CardRoot } from './CardRoot';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  CardActions,
} from './CardSubcomponents';

export * from './types';
export * from './CardRoot';
export * from './CardSubcomponents';

export interface CardCompound extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Actions: typeof CardActions;
}

export const Card = CardRoot as CardCompound;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Actions = CardActions;
