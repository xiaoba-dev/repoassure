import {ChangeEvent, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Multi-line text field, vertically resizable" viewport="420x160" */
export interface TextareaProps {
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  rows?: number;
  invalid?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}
export declare function Textarea(props: TextareaProps): ReactElement;
