import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="Metadata definition grid (run manifest, config)" viewport="640x180" */
export interface KeyValueItem { label: ReactNode; value: ReactNode; mono?: boolean; }
export interface KeyValueListProps {
  items: KeyValueItem[];
  columns?: number;
}
export declare function KeyValueList(props: KeyValueListProps): ReactElement;
