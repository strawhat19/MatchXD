import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { Row, Button } from '../../components/ui';
import { AppIcon } from '../../components/BrandMark';
import { useTheme } from '../../theme/ThemeProvider';
import { View, Pressable, useWindowDimensions } from 'react-native';

const headerWordmarks = {
  connected: { light: require('../../../assets/brand/variants/01-connected-wordmark-light.svg'), dark: require('../../../assets/brand/variants/01-connected-wordmark-dark.svg') },
  signed: { light: require('../../../assets/brand/variants/05-xoxo-signature-light.svg'), dark: require('../../../assets/brand/variants/05-xoxo-signature-dark.svg') },
};

export const LandingHeader = () => {
  const { act } = useApp();
  const { width } = useWindowDimensions();
  const { colors, dark } = useTheme();
  const large = width >= 700;
  const wordmark = headerWordmarks[large ? `signed` : `connected`][dark ? `dark` : `light`];
  return <View style={{ width: `100%`, backgroundColor: colors.bg }}>
    <View style={{ width: `100%`, maxWidth: 1330, alignSelf: `center`, paddingHorizontal: width >= 860 ? 55 : width < 380 ? 16 : 24 }}>
      <Row style={{ paddingVertical: large ? 10 : 16, justifyContent: `space-between` }}>
        <Row style={{ flex: 1, minWidth: 0, gap: large ? 12 : 8 }}><AppIcon size={46} /><Image source={wordmark} accessible={false} alt="" contentFit="contain" contentPosition="left center" style={{ width: large ? 154 : 160, height: large ? 46 : 34, flexShrink: 1 }} /></Row>
        <Row style={{ gap: large ? 12 : 8, flexShrink: 0 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Toggle Theme" onPress={() => act({ type: `save-settings`, settings: { theme: dark ? `light` : `dark` } })} style={{ padding: large ? 12 : 10 }}><Icon name={dark ? `sun` : `moon`} color={colors.muted} /></Pressable>
          <Button label="Sign In" variant="secondary" onPress={() => router.push(`/sign-in`)} style={large ? undefined : { paddingHorizontal: 12 }} />
        </Row>
      </Row>
    </View>
  </View>;
};
