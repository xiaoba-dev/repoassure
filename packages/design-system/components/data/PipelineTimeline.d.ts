import { ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="Vertical audit-trail chain: docs → code → tests → acceptance" viewport="380x340" */
export interface PipelineStep { title: string; detail?: string; hash?: string; state?: 'done' | 'active' | 'pending' | 'failed'; }
export interface PipelineTimelineProps {
  steps: PipelineStep[];
}
export declare function PipelineTimeline(props: PipelineTimelineProps): ReactElement;
