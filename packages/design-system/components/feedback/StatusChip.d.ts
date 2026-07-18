import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Feedback" subtitle="Pill for evidence state: verified, signed, local, pending, failed" viewport="620x120" */
export interface StatusChipProps {
  status?: 'verified' | 'signed' | 'local' | 'pending' | 'failed' | 'neutral';
  children?: ReactNode;
}
export declare function StatusChip(props: StatusChipProps): ReactElement;
