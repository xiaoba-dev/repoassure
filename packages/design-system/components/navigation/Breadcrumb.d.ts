import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Navigation" subtitle="Hierarchical path with chevron separators" viewport="560x90" */
export interface BreadcrumbItem { label: ReactNode; href?: string; }
export interface BreadcrumbProps { items: BreadcrumbItem[]; }
export declare function Breadcrumb(props: BreadcrumbProps): ReactElement;
