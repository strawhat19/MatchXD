import './LiquidPressable.css';
import { Pressable } from 'react-native';
import type { LiquidPressableProps } from './LiquidPressable.types';

export const LiquidPressable = ({ fill, backFill, children, ...props }: LiquidPressableProps) => <Pressable {...props} {...{ dataSet: { liquid: `button` } }}>
  {backFill ? <span aria-hidden="true" className="mxd-liquid-wave mxd-liquid-wave-back" style={{ backgroundColor: backFill }} /> : null}
  <span aria-hidden="true" className={`mxd-liquid-wave${backFill ? ` mxd-liquid-wave-front` : ``}`} style={{ backgroundColor: fill }} />
  {children}
</Pressable>;
