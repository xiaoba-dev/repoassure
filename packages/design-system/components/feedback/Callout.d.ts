import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Inline note: info / success / warning / danger" viewport="640x180" */
export interface CalloutProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  children: ReactNode;
}
export declare function Callout(props: CalloutProps): ReactElement;
