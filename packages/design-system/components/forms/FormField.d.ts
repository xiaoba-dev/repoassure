import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Label + hint + error wrapper for any field control" viewport="420x160" */
export interface FormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}
export declare function FormField(props: FormFieldProps): ReactElement;
