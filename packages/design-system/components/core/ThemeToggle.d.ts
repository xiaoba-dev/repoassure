import { ReactElement } from 'react';
/** @startingPoint section="Core" subtitle="Light / dark segmented control; sets data-theme by default" viewport="360x120" */
export interface ThemeToggleProps {
  value?: 'light' | 'dark';
  onChange?: (value: 'light' | 'dark') => void;
}
export declare function ThemeToggle(props: ThemeToggleProps): ReactElement;
