import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Full-width page notice with accent edge & optional action" viewport="700x120" */
export interface BannerProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  action?: ReactNode;
  onDismiss?: () => void;
  children: ReactNode;
}
export declare function Banner(props: BannerProps): ReactElement;
