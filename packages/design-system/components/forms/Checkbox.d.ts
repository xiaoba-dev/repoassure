import {ReactNode, ChangeEvent, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Checkbox with checked / indeterminate states" viewport="420x140" */
export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}
export declare function Checkbox(props: CheckboxProps): ReactElement;
