import {ChangeEvent, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Native dropdown with custom chevron" viewport="420x120" */
export interface SelectOption { value: string; label: string; }
export interface SelectProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  options: (string | SelectOption)[];
  invalid?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}
export declare function Select(props: SelectProps): ReactElement;
