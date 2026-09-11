import { useEffect, useState } from 'react';
import { useTypingWord } from './useTypingWord';
import { Button, Txt } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { View, AppState, StyleSheet } from 'react-native';
import type { SparkButtonProps } from './SparkButton.types';
import Animated, { withRepeat, withTiming, cancelAnimation, useSharedValue, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';

export const SparkButton = ({ onPress, active = true, style }: SparkButtonProps) => {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const [foreground, setForeground] = useState(() => AppState.currentState === `active`);
  const { text, word, phase } = useTypingWord(active && foreground, reducedMotion);
  const caretOpacity = useSharedValue(0);
  useEffect(() => {
    const subscription = AppState.addEventListener(`change`, state => setForeground(state === `active`));
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    cancelAnimation(caretOpacity);
    const visible = active && foreground && !reducedMotion;
    caretOpacity.set(visible ? 1 : 0);
    if (visible && phase === `hold`) caretOpacity.set(withRepeat(withTiming(0, { duration: 500 }), -1, true));
    return () => cancelAnimation(caretOpacity);
  }, [active, foreground, reducedMotion, phase, caretOpacity]);
  const caretStyle = useAnimatedStyle(() => ({ opacity: caretOpacity.get() }));
  return <Button label={`Find your ${word}`} icon="arrow-up-right" disabled={!active} liquidColors={[`#FFFFFF`, `#FFD7DB`]} onPress={onPress} style={style} labelContent={
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.label}>
      <Txt color={colors.onAccent} weight="semibold">{`Find your `}</Txt>
      <View style={styles.word}>
        <Txt color={colors.onAccent} weight="semibold" style={styles.sizer}>person</Txt>
        <View style={styles.typed}><Txt color={colors.onAccent} weight="semibold">{text}</Txt><Animated.View style={[styles.caret, caretStyle, { backgroundColor: colors.onAccent }]} /></View>
      </View>
    </View>
  } />;
};

const styles = StyleSheet.create({
  sizer: { opacity: 0 },
  word: { position: `relative`, paddingRight: 6 },
  label: { flexDirection: `row`, alignItems: `center` },
  caret: { width: 1.5, height: 14, marginLeft: 3, borderRadius: 1 },
  typed: { position: `absolute`, left: 0, top: 0, bottom: 0, flexDirection: `row`, alignItems: `center` },
});
