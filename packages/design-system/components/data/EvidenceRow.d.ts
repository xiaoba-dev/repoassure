import { ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="Artifact ledger row: status · artifact · content hash" viewport="700x110" */
export interface EvidenceRowProps {
  status?: 'verified' | 'hashed' | 'pending' | 'failed';
  artifact: string;
  summary?: string;
  hash?: string;
  timestamp?: string;
}
export declare function EvidenceRow(props: EvidenceRowProps): ReactElement;
