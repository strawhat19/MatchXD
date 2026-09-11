import type { ReactNode } from 'react';
import { decorateXoText } from './XoToken';
import { Icon, type IconName } from './Icon';
import { fontFamily } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { LiquidPressable } from './LiquidPressable';
import { xoAccessibilityLabel } from './XoToken.shared';
import { Text, View, Switch, Platform, Pressable, TextInput, ScrollView, StyleSheet, useWindowDimensions, type TextProps, type ViewStyle, type StyleProp, type TextInputProps } from 'react-native';

type Weight = keyof typeof fontFamily;
export const Txt = ({ size = 14, weight = `regular`, decorateXo = true, children, color, style, accessibilityLabel, ...props }: TextProps & { size?: number; weight?: Weight; color?: string; decorateXo?: boolean }) => {
  const { colors } = useTheme();
  const textSize = StyleSheet.flatten(style)?.fontSize ?? size;
  return <Text {...props} accessibilityLabel={accessibilityLabel ?? (decorateXo && Platform.OS !== `web` ? xoAccessibilityLabel(children) : undefined)} style={[{ color: color ?? colors.text, fontSize: size, lineHeight: size * 1.5, fontFamily: fontFamily[weight] }, style]}>{decorateXo ? decorateXoText(children, textSize * 1.15) : children}</Text>;
};

export const Row = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[{ gap: 12, flexDirection: `row`, alignItems: `center` }, style]}>{children}</View>;

export const Panel = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { colors } = useTheme();
  return <View style={[{ gap: 18, padding: 24, borderWidth: 1, borderRadius: 22, backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
};

export const Button = ({ label, labelContent, onPress, variant = `primary`, icon, disabled, style, liquidColors }: { label: string; labelContent?: ReactNode; onPress: () => void; variant?: `primary` | `secondary` | `ghost` | `danger`; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; liquidColors?: readonly [string, string] }) => {
  const { colors, dark } = useTheme();
  const color = variant === `primary` ? colors.onAccent : variant === `danger` ? colors.danger : colors.text;
  const fill = variant === `primary` ? `#FF91A4` : dark ? `#462A39` : `#FFDEE6`;
  return <LiquidPressable fill={liquidColors?.[1] ?? fill} backFill={liquidColors?.[0]} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={({ pressed }) => [{ minHeight: 48, gap: 10, paddingHorizontal: 19, paddingVertical: 11, borderRadius: 14, flexDirection: `row`, alignItems: `center`, justifyContent: `center`, opacity: disabled ? .4 : 1, transform: [{ scale: pressed ? .98 : 1 }], backgroundColor: variant === `primary` ? colors.accent : variant === `ghost` ? `transparent` : colors.raised, borderWidth: variant === `secondary` ? 1 : 0, borderColor: colors.border }, style]}>
    {icon ? <Icon name={icon} color={color} size={18} /> : null}{labelContent ?? <Txt color={color} weight="semibold">{label}</Txt>}
  </LiquidPressable>;
};

export const Field = ({ label, style, ...props }: TextInputProps & { label?: string }) => {
  const { colors } = useTheme();
  return <View style={{ gap: 7 }}>
    {label ? <Txt weight="medium">{label}</Txt> : null}
    <TextInput accessibilityLabel={label ?? props.placeholder} placeholderTextColor={colors.muted} selectionColor={colors.accent} {...props} style={[{ minHeight: 49, paddingVertical: 12, paddingHorizontal: 15, borderWidth: 1, borderRadius: 12, fontSize: 15, fontFamily: fontFamily.regular, color: colors.text, borderColor: colors.border, backgroundColor: colors.raised, textAlignVertical: props.multiline ? `top` : `center` }, style]} />
  </View>;
};

export const Chip = ({ label, selected, disabled, onPress }: { label: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) => {
  const { colors } = useTheme();
  return <Pressable accessibilityRole={onPress ? `button` : `text`} accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 13, paddingVertical: 8, borderWidth: 1, borderRadius: 30, opacity: disabled ? .4 : 1, transform: [{ scale: pressed ? .98 : 1 }], borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.pale : colors.raised })}><Txt size={13} color={selected ? colors.accentText : colors.muted} weight={selected ? `medium` : `regular`}>{label}</Txt></Pressable>;
};

export const Page = ({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  return <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: 36 }}><View style={{ width: `100%`, maxWidth: 1130, alignSelf: `center`, padding: width < 700 ? 20 : 34, gap: 25 }}>
    <View style={{ gap: 18, flexDirection: width > 700 ? `row` : `column`, justifyContent: `space-between`, alignItems: width > 700 ? `center` : `stretch` }}><View style={{ flexShrink: 1 }}><Txt size={width < 700 ? 28 : 34} weight="bold" style={{ letterSpacing: -1 }}>{title}</Txt>{subtitle ? <Txt color={colors.muted} style={{ marginTop: 5 }}>{subtitle}</Txt> : null}</View>{action}</View>
    {children}
  </View></ScrollView>;
};

export const SwitchRow = ({ label, description, value, onValueChange }: { label: string; description?: string; value: boolean; onValueChange: (value: boolean) => void }) => {
  const { colors } = useTheme();
  return <Row style={{ justifyContent: `space-between` }}><View style={{ flex: 1, gap: 4 }}><Txt weight="medium">{label}</Txt>{description ? <Txt size={13} color={colors.muted}>{description}</Txt> : null}</View><Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} trackColor={{ true: colors.accent, false: colors.border }} thumbColor="#FFFFFF" /></Row>;
};

export const EmptyState = ({ icon = `heart`, title, description, action }: { icon?: IconName; title: string; description: string; action?: ReactNode }) => {
  const { colors } = useTheme();
  return <Panel style={{ alignItems: `center`, paddingVertical: 50 }}><View style={{ padding: 22, borderRadius: 50, backgroundColor: colors.pale }}><Icon name={icon} color={colors.accent} size={30} /></View><Txt size={22} weight="semibold">{title}</Txt><Txt color={colors.muted} style={{ maxWidth: 390, textAlign: `center` }}>{description}</Txt>{action}</Panel>;
};

export const Divider = () => {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
};
