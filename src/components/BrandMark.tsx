import { View } from 'react-native';
import { Txt } from './ui';
import { useTheme } from '../theme/ThemeProvider';
import Svg, { Defs, Rect, Path, Stop, Circle, LinearGradient } from 'react-native-svg';

export const ConnectedX = ({ size = 34, white = false }: { size?: number; white?: boolean }) => <Svg width={size} height={size} viewBox="0 0 100 110">
  <Circle cx="27" cy="12" r="10" fill={white ? `#FFD7DB` : `#FFA3AE`} />
  <Circle cx="77" cy="12" r="10" fill={white ? `#FFFFFF` : `#FF4964`} />
  <Path d="M10 104 L60 42 Q72 24 94 33 L42 96 Q36 104 24 104Z" fill={white ? `#FFFFFF` : `#FA3D60`} />
  <Path d="M12 33 Q33 24 46 42 L96 104H82 Q70 104 63 95Z" fill={white ? `#FFD7DB` : `#FF9DAA`} />
</Svg>;

export const AppIcon = ({ size = 43 }: { size?: number }) => <View accessibilityLabel="MatchXD" style={{ width: size, height: size }}>
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs><LinearGradient id="brand" x1="0" x2="1" y1="0" y2="1"><Stop stopColor="#FF686C" /><Stop offset="1" stopColor="#F33765" /></LinearGradient></Defs>
    <Rect width="120" height="120" rx="32" fill="url(#brand)" />
  </Svg>
  <View style={{ position: `absolute`, top: size * .18, left: size * .22 }}><ConnectedX size={size * .57} white /></View>
</View>;

export const BrandMark = ({ size = 27, color }: { size?: number; color?: string }) => {
  const { colors } = useTheme();
  return <View accessibilityLabel="MatchXD" style={{ flexDirection: `row`, alignItems: `center` }}>
    <Txt size={size} weight="bold" color={color ?? colors.text} style={{ letterSpacing: -1.5 }}>MATCH</Txt>
    <View style={{ marginLeft: -1, marginRight: -1 }}><ConnectedX size={size * 1.04} /></View>
    <Txt size={size} weight="bold" color={color ?? colors.text} style={{ letterSpacing: -1 }}>D</Txt>
  </View>;
};
