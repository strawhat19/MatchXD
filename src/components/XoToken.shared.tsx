import { Text, Platform } from 'react-native';
import { isValidElement, type ReactNode, type ComponentType } from 'react';

export type XoTokenProps = { size?: number; label?: string; decorative?: boolean };
export type XoCopyProps = { children: ReactNode; size?: number };

const textContent = (children: ReactNode): string => {
  if (typeof children === `string` || typeof children === `number`) return `${children}`;
  if (Array.isArray(children)) return children.map(textContent).join(``);
  return isValidElement<{ children?: ReactNode }>(children) ? textContent(children.props.children) : ``;
};

export const xoAccessibilityLabel = (children: ReactNode): string | undefined => {
  const text = textContent(children);
  return /(^|[^\p{L}\p{N}_])XO(?:\(s\)|['’]s|s)?(?![\p{L}\p{N}_])/iu.test(text) ? text : undefined;
};

export const decorateXoChildren = (children: ReactNode, size: number, Token: ComponentType<XoTokenProps>): ReactNode => {
  if (Array.isArray(children)) return children.map(child => decorateXoChildren(child, size, Token));
  if (typeof children !== `string`) return children;
  const words = /(^|[^\p{L}\p{N}_])(XO(?:\(s\)|['’]s|s)?)(?![\p{L}\p{N}_])/giu;
  const result: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = words.exec(children)) !== null) {
    const start = match.index + match[1].length;
    result.push(children.slice(cursor, start), <Token key={`xo-${start}`} size={size} label={match[2]} decorative={false} />);
    if (match[2].toLowerCase() !== `xo`) result.push(Platform.OS === `web` ? <span key={`xo-suffix-${start}`} aria-hidden="true">’s</span> : <Text key={`xo-suffix-${start}`} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">’s</Text>);
    cursor = start + match[2].length;
  }
  return cursor ? [...result, children.slice(cursor)] : children;
};
