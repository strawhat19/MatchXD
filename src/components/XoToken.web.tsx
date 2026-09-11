import './XoToken.css';
import { Asset } from 'expo-asset';
import type { ReactNode } from 'react';
import { decorateXoChildren, type XoCopyProps, type XoTokenProps } from './XoToken.shared';

const tokenImage = Asset.fromModule(require('../../assets/brand/xo-token.png')).uri;

export const XoToken = ({ size = 18, label = `XO coin`, decorative = true }: XoTokenProps) => <img className="mxd-xo-token" src={tokenImage} alt={decorative ? `` : label} aria-hidden={decorative || undefined} draggable={false} width={size} height={size} style={{ width: size, height: size }} />;

export const decorateXoText = (children: ReactNode, size: number): ReactNode => decorateXoChildren(children, size, XoToken);
export const XoCopy = ({ children, size = 18 }: XoCopyProps) => <span className="mxd-xo-copy">{decorateXoText(children, size)}</span>;
