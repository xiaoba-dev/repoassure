import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Hover / focus label on any trigger" viewport="360x160" */
export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}
export declare function Tooltip(props: TooltipProps): ReactElement;
