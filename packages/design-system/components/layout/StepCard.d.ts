import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Layout" subtitle="Numbered / icon step in a how-it-works flow" viewport="360x260" */
export interface StepCardProps { index?: number; icon?: ReactNode; title: ReactNode; children: ReactNode; }
export declare function StepCard(props: StepCardProps): ReactElement;
