import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Core" subtitle="Primary, secondary, ghost & danger CTAs" viewport="720x240" */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: ReactNode;
}
export declare function Button(props: ButtonProps): ReactElement;
