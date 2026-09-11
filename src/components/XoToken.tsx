import type { ReactNode } from 'react';
import { Image, Text } from 'react-native';
import { decorateXoChildren, xoAccessibilityLabel, type XoCopyProps, type XoTokenProps } from './XoToken.shared';

const tokenImage = require('../../assets/brand/xo-token.png');

export const XoToken = ({ size = 18, label = `XO coin`, decorative = true }: XoTokenProps) => <Image source={tokenImage} resizeMode="contain" accessible={!decorative} accessibilityElementsHidden={decorative} importantForAccessibility={decorative ? `no-hide-descendants` : `auto`} accessibilityLabel={decorative ? undefined : label} style={{ width: size, height: size }} />;

export const decorateXoText = (children: ReactNode, size: number): ReactNode => decorateXoChildren(children, size, XoToken);
export const XoCopy = ({ children, size = 18 }: XoCopyProps) => <Text accessibilityLabel={xoAccessibilityLabel(children)}>{decorateXoText(children, size)}</Text>;
