import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Layout" subtitle="Dark 'Evidence Console' surface with grid + ambient glow" viewport="640x300" */
export interface PanelProps { title?: ReactNode; eyebrow?: ReactNode; action?: ReactNode; grid?: boolean; children: ReactNode; }
export declare function Panel(props: PanelProps): ReactElement;
