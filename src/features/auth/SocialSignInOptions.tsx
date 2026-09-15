import { Icon } from '../../components/Icon';
import { Txt, Row } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { View, Pressable, StyleSheet } from 'react-native';
import { SocialProviderIcon } from '../../components/SocialProviderIcon';

const providers = [
  { name: `Google`, icon: `google`, color: `#4285F4` },
  { name: `Apple`, icon: `apple` },
  { name: `Facebook`, icon: `facebook`, color: `#1877F2` },
  { name: `Phone`, icon: `phone` },
] as const;

export const SocialSignInOptions = ({ compact = false }: { compact?: boolean }) => {
  const { colors } = useTheme();
  return <View style={{ gap: 12 }}>
    <View style={[styles.providers, compact && { gap: 8 }]}>
      {providers.map(provider => <Pressable key={provider.name} disabled accessibilityRole={`button`} accessibilityState={{ disabled: true }} accessibilityLabel={`${provider.name} Sign-In — Coming Soon`} style={[styles.provider, { borderColor: colors.border, backgroundColor: colors.surface }, !compact && provider.name === `Google` ? styles.google : null, compact ? styles.compact : null]}>
        <SocialProviderIcon size={compact ? 18 : 21} name={provider.icon} color={`color` in provider ? provider.color : colors.text} />
        <Txt size={compact ? 11 : 13} weight={`medium`}>{!compact && provider.name === `Google` ? `Continue With Google` : provider.name}</Txt>
        {!compact && provider.name === `Google` ? <View style={[styles.badge, { backgroundColor: colors.raised }]}><Txt size={10} color={colors.muted}>Soon</Txt></View> : null}
      </Pressable>)}
    </View>
    <Row style={{ gap: 7, alignItems: `flex-start` }}><Icon name={`info`} size={14} color={colors.muted} /><Txt size={12} color={colors.muted} style={{ flex: 1 }}>Google, Apple, Facebook, and phone sign-in are coming soon.</Txt></Row>
  </View>;
};

const styles = StyleSheet.create({
  compact: { gap: 7, minWidth: 68, minHeight: 43, paddingHorizontal: 8 },
  google: { flexBasis: `100%`, minHeight: 54 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  providers: { gap: 10, flexDirection: `row`, flexWrap: `wrap` },
  provider: { flex: 1, gap: 9, minHeight: 50, minWidth: 90, borderWidth: 1, borderRadius: 13, flexDirection: `row`, alignItems: `center`, justifyContent: `center`, paddingHorizontal: 12 },
});
