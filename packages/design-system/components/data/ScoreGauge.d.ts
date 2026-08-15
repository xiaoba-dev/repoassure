import { ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="Readiness-score ring; tone shifts by threshold" viewport="420x160" */
export interface ScoreBreakdown { k: string; v: number; c?: string; }
export interface ScoreGaugeProps {
  score?: number;
  max?: number;
  size?: number;
  label?: string;
  breakdown?: ScoreBreakdown[];
}
export declare function ScoreGauge(props: ScoreGaugeProps): ReactElement;
