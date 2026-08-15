import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="Compact data grid with uppercase header row" viewport="700x260" */
export interface DataColumn { key: string; header: ReactNode; align?: 'left' | 'right' | 'center'; mono?: boolean; }
export interface DataTableProps {
  columns: DataColumn[];
  rows: Record<string, ReactNode>[];
  dense?: boolean;
}
export declare function DataTable(props: DataTableProps): ReactElement;
