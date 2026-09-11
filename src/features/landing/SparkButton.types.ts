import type { ViewStyle, StyleProp } from 'react-native';

export type SparkButtonProps = {
  onPress: () => void;
  active?: boolean;
  className?: string;
  revealDelay?: number;
  style?: StyleProp<ViewStyle>;
};
