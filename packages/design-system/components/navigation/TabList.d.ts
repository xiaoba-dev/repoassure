import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Navigation" subtitle="Underline tabs with optional count badges" viewport="620x110" */
export interface TabItem { id: string; label: ReactNode; count?: number; }
export interface TabListProps { tabs: TabItem[]; value?: string; onChange?: (id: string) => void; }
export declare function TabList(props: TabListProps): ReactElement;
