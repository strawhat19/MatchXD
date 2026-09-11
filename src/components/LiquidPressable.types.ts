import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';

export type LiquidPressableProps = Omit<PressableProps, `children`> & {
  fill: string;
  backFill?: string;
  children: ReactNode;
};
