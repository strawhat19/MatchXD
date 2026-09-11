import { Image } from 'expo-image';
import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { Row, Button } from '../../components/ui';
import { AppIcon } from '../../components/BrandMark';
import { useTheme } from '../../theme/ThemeProvider';
import { Link, router, type LinkProps } from 'expo-router';
import { View, Pressable, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown, ReduceMotion } from 'react-native-reanimated';

const headerWordmarks = {
  connected: { light: require('../../../assets/brand/variants/01-connected-wordmark-light.svg'), dark: require('../../../assets/brand/variants/01-connected-wordmark-dark.svg') },
  signed: { light: require('../../../assets/brand/variants/05-xoxo-signature-light.svg'), dark: require('../../../assets/brand/variants/05-xoxo-signature-dark.svg') },
};
const headerReveals = [0, 60, 120, 180].map(delay => FadeInDown.duration(460).delay(delay).easing(Easing.bezier(.16, 1, .3, 1)).reduceMotion(ReduceMotion.System));

export const LandingHeader = ({ onHome }: { onHome?: () => void }) => {
  const { act } = useApp();
  const { width } = useWindowDimensions();
  const { colors, dark } = useTheme();
  const large = width >= 700;
  const wordmark = headerWordmarks[large ? `signed` : `connected`][dark ? `dark` : `light`];
  const goHome: NonNullable<LinkProps['onPress']> = event => {
    if (!onHome || event.defaultPrevented) return;
    if (`button` in event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || (event.currentTarget.target && event.currentTarget.target !== `_self`))) return;
    event.preventDefault();
    onHome();
  };
  return <View style={{ width: `100%`, backgroundColor: colors.bg }}>
    <View style={{ width: `100%`, maxWidth: 1330, alignSelf: `center`, paddingHorizontal: width >= 860 ? 55 : width < 380 ? 16 : 24 }}>
      <Row style={{ paddingVertical: large ? 10 : 16, justifyContent: `space-between` }}>
        <Row style={{ flex: 1, minWidth: 0 }}><Link href="/" asChild><Pressable accessible accessibilityRole="link" accessibilityLabel="MatchXD Home" onPress={goHome} style={{ minWidth: 0, flexShrink: 1, flexDirection: `row`, alignItems: `center`, gap: large ? 12 : 8 }}>
          <Animated.View entering={headerReveals[0]} style={{ width: 46, height: 46, flexShrink: 0 }}><AppIcon size={46} /></Animated.View>
          <Animated.View entering={headerReveals[1]} style={{ minWidth: 0, width: large ? 154 : 160, height: large ? 46 : 34, flexShrink: 1 }}><Image source={wordmark} accessible={false} alt="" contentFit="contain" contentPosition="left center" style={{ width: `100%`, height: `100%` }} /></Animated.View>
        </Pressable></Link></Row>
        <Row style={{ gap: large ? 12 : 8, flexShrink: 0 }}>
          <Animated.View entering={headerReveals[2]} style={{ flexShrink: 0 }}><Pressable accessibilityRole="button" accessibilityLabel="Toggle Theme" onPress={() => act({ type: `save-settings`, settings: { theme: dark ? `light` : `dark` } })} style={{ padding: large ? 12 : 10 }}><Icon name={dark ? `sun` : `moon`} color={colors.muted} /></Pressable></Animated.View>
          <Animated.View entering={headerReveals[3]} style={{ flexShrink: 0 }}><Button label="Sign In" icon="log-in" variant="secondary" onPress={() => router.push(`/sign-in`)} style={large ? undefined : { gap: 6, paddingHorizontal: 12 }} /></Animated.View>
        </Row>
      </Row>
    </View>
  </View>;
};
