import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Layout" subtitle="Flat content card: media / title / body / footer" viewport="420x300" */
export interface CardProps { title?: ReactNode; subtitle?: ReactNode; media?: ReactNode; footer?: ReactNode; interactive?: boolean; children?: ReactNode; }
export declare function Card(props: CardProps): ReactElement;
