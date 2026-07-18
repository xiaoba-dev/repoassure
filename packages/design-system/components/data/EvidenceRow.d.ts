import { ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="Signed-artifact ledger row: status · artifact · hash" viewport="700x110" */
export interface EvidenceRowProps {
  status?: 'verified' | 'signed' | 'pending' | 'failed';
  artifact: string;
  summary?: string;
  hash?: string;
  timestamp?: string;
}
export declare function EvidenceRow(props: EvidenceRowProps): ReactElement;
