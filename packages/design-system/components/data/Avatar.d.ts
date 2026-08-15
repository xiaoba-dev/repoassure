import { ReactElement } from 'react';
/** @startingPoint section="Data" subtitle="User/team avatar — image or generated initials" viewport="360x120" */
export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  square?: boolean;
}
export declare function Avatar(props: AvatarProps): ReactElement;
