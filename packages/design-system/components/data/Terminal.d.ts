import { ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="CLI output block on the console surface" viewport="620x300" */
export interface TerminalLine { type?: 'cmd' | 'out' | 'ok' | 'warn' | 'err' | 'info'; text: string; }
export interface TerminalProps {
  title?: string;
  prompt?: string;
  lines: (string | TerminalLine)[];
}
export declare function Terminal(props: TerminalProps): ReactElement;
