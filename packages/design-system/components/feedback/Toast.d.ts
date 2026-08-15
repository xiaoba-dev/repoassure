import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Transient overlay notification" viewport="440x140" */
export interface ToastProps {
  variant?: 'success' | 'danger' | 'info';
  title: ReactNode;
  description?: ReactNode;
  onDismiss?: () => void;
}
export declare function Toast(props: ToastProps): ReactElement;
