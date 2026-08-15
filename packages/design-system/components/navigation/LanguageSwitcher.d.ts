import { ReactElement } from 'react';
/** @startingPoint section="Navigation" subtitle="Locale picker — en / zh-CN shipping, ja / ko roadmap" viewport="360x120" */
export interface Language { code: string; label: string; }
export interface LanguageSwitcherProps { value?: string; languages?: Language[]; onChange?: (code: string) => void; }
export declare function LanguageSwitcher(props: LanguageSwitcherProps): ReactElement;
