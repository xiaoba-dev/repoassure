import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Risk severity tag: P0 (danger) / P1 (warning) / P2 (info)" viewport="480x120" */
export interface SeverityChipProps {
  level?: 'p0' | 'p1' | 'p2';
  count?: number;
  children?: ReactNode;
}
export declare function SeverityChip(props: SeverityChipProps): ReactElement;
