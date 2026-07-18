import { ReactElement } from 'react';
/** @startingPoint section="Navigation" subtitle="Page control with truncation & prev/next" viewport="520x100" */
export interface PaginationProps { page?: number; total?: number; onChange?: (page: number) => void; }
export declare function Pagination(props: PaginationProps): ReactElement;
