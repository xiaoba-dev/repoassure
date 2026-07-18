import {ReactNode, ChangeEvent, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Single-line text field with optional leading icon" viewport="420x120" */
export interface TextInputProps {
  id?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'number';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  invalid?: boolean;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export declare function TextInput(props: TextInputProps): ReactElement;
