import Svg from 'react-native-svg';
import { Platform } from 'react-native';
import { iconPaths } from './iconPaths';
import { useTheme } from '../theme/ThemeProvider';

export type IconName = keyof typeof iconPaths;
export const Icon = ({ name, size = 21, color, fill = `none` }: { name: IconName; size?: number; color?: string; fill?: string }) => {
  const { colors } = useTheme();
  return <Svg width={size} height={size} viewBox={`0 0 24 24`} fill={fill} stroke={color ?? colors.text} strokeWidth={2} strokeLinecap={`round`} strokeLinejoin={`round`} accessible={Platform.OS === `web` ? undefined : false} aria-hidden={true} focusable={false} style={{ flexShrink: 0 }}>{iconPaths[name]}</Svg>;
};
