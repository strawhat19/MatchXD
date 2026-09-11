import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../theme/ThemeProvider';

export type IconName = keyof typeof Feather.glyphMap;
export const Icon = ({ name, size = 21, color }: { name: IconName; size?: number; color?: string }) => {
  const { colors } = useTheme();
  return <Feather name={name} size={size} color={color ?? colors.text} />;
};
