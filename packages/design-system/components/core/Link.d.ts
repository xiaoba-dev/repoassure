import {ReactNode, ReactElement } from 'react';
/** @startingPoint section="Core" subtitle="Inline text link — control-blue, external variant" viewport="360x120" */
export interface LinkProps {
  href?: string;
  muted?: boolean;
  external?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
export declare function Link(props: LinkProps): ReactElement;
