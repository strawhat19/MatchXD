import { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import { Pressable, StyleSheet } from 'react-native';
import type { LiquidPressableProps } from './LiquidPressable.types';
import Animated, { Easing, withDelay, withTiming, cancelAnimation, useSharedValue, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';

export const LiquidPressable = ({ fill, style, backFill, children, disabled, onLayout, onPressIn, onPressOut, ...props }: LiquidPressableProps) => {
  const progress = useSharedValue(0);
  const backProgress = useSharedValue(0);
  const width = useSharedValue(180);
  const height = useSharedValue(48);
  const reducedMotion = useReducedMotion();
  const wave = useAnimatedStyle(() => ({ transform: [{ translateX: width.get() * (-.2 + progress.get() * .4) }, { translateY: height.get() * 1.42 * (1 - progress.get()) }] }));
  const backWave = useAnimatedStyle(() => ({ transform: [{ translateX: width.get() * (.2 - backProgress.get() * .4) }, { translateY: height.get() * 1.42 * (1 - backProgress.get()) }] }));
  const animate = (active: boolean) => {
    cancelAnimation(progress);
    cancelAnimation(backProgress);
    const target = Number(active && !disabled);
    const timing = { duration: target ? 450 : 260, easing: Easing.bezier(.22, 1, .36, 1) };
    const animation = withTiming(target, timing);
    progress.set(reducedMotion ? target : target && backFill ? withDelay(80, animation) : animation);
    if (backFill) backProgress.set(reducedMotion ? target : withTiming(target, timing));
  };

  useEffect(() => {
    if (disabled) { cancelAnimation(progress); cancelAnimation(backProgress); progress.set(0); backProgress.set(0); }
    return () => { cancelAnimation(progress); cancelAnimation(backProgress); };
  }, [disabled, progress, backProgress]);

  return <Pressable {...props} disabled={disabled} onLayout={event => { width.set(event.nativeEvent.layout.width); height.set(event.nativeEvent.layout.height); onLayout?.(event); }} onPressIn={event => { animate(true); onPressIn?.(event); }} onPressOut={event => { animate(false); onPressOut?.(event); }} style={state => [typeof style === `function` ? style(state) : style, styles.surface]}>
    {backFill ? <Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.wave, backWave]}><Svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none"><Path d="M0 12Q25 0 50 12T100 12T150 12T200 12V100H0Z" fill={backFill} /></Svg></Animated.View> : null}
    <Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.wave, wave]}><Svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none"><Path d="M0 12Q25 0 50 12T100 12T150 12T200 12V100H0Z" fill={fill} /></Svg></Animated.View>
    {children}
  </Pressable>;
};

const styles = StyleSheet.create({
  surface: { overflow: `hidden` },
  wave: { bottom: -1, left: `-50%`, width: `200%`, height: `140%`, position: `absolute` },
});
