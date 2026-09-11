import { View } from 'react-native';
import { useId, useEffect } from 'react';
import { XoToken } from '../../components/XoToken';
import Svg, { Defs, Path, Text, Circle, TextPath } from 'react-native-svg';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export const WordCircle = ({ active = true }: { active?: boolean }) => {
  const arc = `connection-ring-${useId().replaceAll(`:`, ``)}`;
  const reduced = useReducedMotion();
  const rotation = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(rotation);
    if (active && !reduced) rotation.set(withRepeat(withTiming(rotation.get() + 360, { duration: 28000, easing: Easing.linear }), -1));
    return () => cancelAnimation(rotation);
  }, [active, reduced, rotation]);
  const motion = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));
  return <View accessibilityLabel="Real people. Brighter connections. XOXO." style={{ width: 144, height: 144, alignSelf: `center` }}>
    <Animated.View style={motion}><Svg width={144} height={144} viewBox="0 0 160 160">
      <Circle cx={80} cy={80} r={79} fill="#17191F" />
      <Defs><Path id={arc} d="M80 17a63 63 0 1 1 0 126a63 63 0 1 1 0-126" /></Defs>
      <Text fill="#FFFFFF" fontSize={11} fontFamily="Poppins_500Medium"><TextPath href={`#${arc}`} textLength={391} lengthAdjust="spacing">REAL PEOPLE ✳ BRIGHTER CONNECTIONS ✳ XOXO ✳ </TextPath></Text>
    </Svg></Animated.View>
    <View style={{ position: `absolute`, inset: 0, alignItems: `center`, justifyContent: `center` }}><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `#FFFFFF`, alignItems: `center`, justifyContent: `center` }}><XoToken size={34} /></View></View>
  </View>;
};
