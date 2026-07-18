import {ReactNode, ChangeEvent, ReactElement } from 'react';
/** @startingPoint section="Forms" subtitle="Binary on/off toggle switch" viewport="420x120" */
export interface SwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}
export declare function Switch(props: SwitchProps): ReactElement;
