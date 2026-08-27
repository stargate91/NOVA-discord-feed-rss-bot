import type React from 'react';
import type { DropdownProps } from './types';
import { DropdownRoot } from './DropdownRoot';
import { DropdownTrigger } from './DropdownTrigger';
import { DropdownMenu } from './DropdownMenu';
import { DropdownSearch } from './DropdownSearch';
import { DropdownItem } from './DropdownItem';
import { DropdownHeader, DropdownDivider, DropdownEmpty } from './DropdownSubcomponents';

export type * from './types';
export { DropdownRoot } from './DropdownRoot';
export { DropdownTrigger } from './DropdownTrigger';
export { DropdownMenu } from './DropdownMenu';
export { DropdownSearch } from './DropdownSearch';
export { DropdownItem } from './DropdownItem';
export { DropdownHeader, DropdownDivider, DropdownEmpty } from './DropdownSubcomponents';

export interface DropdownCompound extends React.FC<DropdownProps> {
  Trigger: typeof DropdownTrigger;
  Menu: typeof DropdownMenu;
  Search: typeof DropdownSearch;
  Item: typeof DropdownItem;
  Header: typeof DropdownHeader;
  Divider: typeof DropdownDivider;
  Empty: typeof DropdownEmpty;
}

export const Dropdown = DropdownRoot as DropdownCompound;
Dropdown.Trigger = DropdownTrigger;
Dropdown.Menu = DropdownMenu;
Dropdown.Search = DropdownSearch;
Dropdown.Item = DropdownItem;
Dropdown.Header = DropdownHeader;
Dropdown.Divider = DropdownDivider;
Dropdown.Empty = DropdownEmpty;
