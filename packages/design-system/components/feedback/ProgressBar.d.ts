import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Linear determinate progress / meter" viewport="460x130" */
export interface ProgressBarProps {
  value?: number;
  max?: number;
  tone?: 'accent' | 'info' | 'warning' | 'danger';
  label?: ReactNode;
  showValue?: boolean;
}
export declare function ProgressBar(props: ProgressBarProps): ReactElement;
