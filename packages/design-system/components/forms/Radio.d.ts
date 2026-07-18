import {ReactNode, ChangeEvent, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Radio option; group by shared name" viewport="420x140" */
export interface RadioProps {
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}
export declare function Radio(props: RadioProps): ReactElement;
