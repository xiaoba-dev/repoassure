import {ReactNode, ChangeEvent, ReactElement, InputHTMLAttributes } from 'react';
/** @startingPoint section="Forms" subtitle="Single-line text field with optional leading icon" viewport="420x120" */
/* The implementation spreads `...rest` onto the underlying <input>, so every native
   input attribute reaches the DOM. Declaring only the named props would type away
   attributes the component genuinely forwards (`required`, `name`, `autoComplete`). */
export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value' | 'defaultValue'> {
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
