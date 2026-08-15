import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Core" subtitle="Square icon-only control with accessible label" viewport="360x120" */
export interface IconButtonProps {
  icon: ReactNode;
  label: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}
export declare function IconButton(props: IconButtonProps): ReactElement;
