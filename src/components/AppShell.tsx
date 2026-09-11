import { Slot, router, usePathname, Redirect } from 'expo-router';
import { Txt, Row } from './ui';
import { Icon, type IconName } from './Icon';
import { Avatar } from './ProfilePhoto';
import { XoToken } from './XoToken';
import { AppIcon, BrandMark } from './BrandMark';
import { useApp } from '../state/AppProvider';
import { useTheme } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Pressable, ScrollView, useWindowDimensions } from 'react-native';

const navigation: { label: string; path: string; icon: IconName }[] = [
  { label: `Discover`, path: `/discover`, icon: `compass` },
  { label: `Matches`, path: `/matches`, icon: `heart` },
  { label: `Messages`, path: `/messages`, icon: `message-circle` },
  { label: `MXO`, path: `/mxo`, icon: `zap` },
  { label: `Profiler`, path: `/profiler`, icon: `search` },
  { label: `Profile`, path: `/profile`, icon: `user` },
];

export const AppShell = () => {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state, ready, act } = useApp();
  const { colors, dark } = useTheme();
  const desktop = width >= 900;
  if (!ready) return null;
  if (!state.session) return <Redirect href="/" />;
  if (!state.session.onboarded) return <Redirect href="/onboarding" />;
  const go = (value: string) => router.push(value as never);
  const selected = (item: typeof navigation[number]) => item.path === `/matches` ? path === `/matches` : item.path === `/messages` ? path.startsWith(`/messages`) : path.startsWith(item.path);
  const balance = state.wallet.daily + state.wallet.purchased;
  const wallet = <Pressable accessibilityRole="button" accessibilityLabel={`Wallet, ${balance} XOs`} onPress={() => go(`/wallet`)} style={{ gap: 9, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 24, flexDirection: `row`, alignItems: `center`, backgroundColor: colors.surface, borderColor: colors.border }}><Txt weight="semibold">{balance} XOs</Txt></Pressable>;
  return <View style={{ flex: 1, flexDirection: `row`, backgroundColor: colors.bg, paddingTop: insets.top }}>
    {desktop ? <View style={{ width: width > 1200 ? 236 : 204, borderRightWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 23, gap: 30 }}>
      <Pressable accessibilityRole="link" accessibilityLabel="MatchXD Discover" onPress={() => go(`/discover`)} style={{ marginTop: 13, marginBottom: 10 }}><BrandMark size={26} /></Pressable>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 7 }}>
        {navigation.map(item => <Pressable key={item.path} accessibilityRole="link" accessibilityState={{ selected: selected(item) }} onPress={() => go(item.path)} style={({ pressed }) => ({ gap: 14, paddingVertical: 15, paddingHorizontal: 15, borderRadius: 13, flexDirection: `row`, alignItems: `center`, backgroundColor: selected(item) ? colors.pale : pressed ? colors.raised : `transparent` })}><Icon name={item.icon} color={selected(item) ? colors.accent : colors.muted} size={21} /><Txt weight={selected(item) ? `semibold` : `regular`} color={selected(item) ? colors.accentText : colors.muted}>{item.label}</Txt>{item.path === `/matches` && state.matches.length ? <View style={{ marginLeft: `auto`, borderRadius: 6, paddingHorizontal: 6, backgroundColor: colors.raised }}><Txt size={11} color={colors.muted}>{state.matches.length}</Txt></View> : null}</Pressable>)}
        {state.session.role === `owner` ? <Pressable accessibilityRole="link" onPress={() => go(`/dashboard`)} style={{ padding: 15 }}><Row><Icon name="grid" color={colors.muted} /><Txt color={colors.muted}>Dashboard</Txt></Row></Pressable> : null}
      </ScrollView>
      <View style={{ gap: 12, padding: 16, borderRadius: 17, backgroundColor: colors.pale }}><Row><XoToken size={19} /><Txt weight="semibold">A little more possibility</Txt></Row><Txt size={12} color={colors.muted}>More XOs. Same real you.</Txt><Pressable accessibilityRole="link" onPress={() => go(`/wallet`)}><Txt color={colors.accentText} weight="semibold">Explore Plans  →</Txt></Pressable></View>
      <Pressable accessibilityRole="link" accessibilityLabel="Settings" onPress={() => go(`/settings`)}><Row><Avatar profile={state.user} size={39} /><View style={{ flex: 1 }}><Txt weight="semibold">{state.user.name}</Txt><Txt size={11} color={colors.muted}>{state.session.role === `owner` ? `Owner` : `Member`}</Txt></View><Icon name="settings" color={colors.muted} size={19} /></Row></Pressable>
    </View> : null}
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ minHeight: desktop ? 86 : 72, borderBottomWidth: 1, borderColor: colors.border, paddingHorizontal: desktop ? 34 : 20, flexDirection: `row`, alignItems: `center`, justifyContent: `space-between`, gap: 15 }}>
        {desktop ? <Row><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} /><Txt size={12} color={colors.muted} style={{ letterSpacing: 1.5 }}>REAL PEOPLE. BRIGHTER CONNECTIONS.</Txt></Row> : <Pressable accessibilityRole="link" accessibilityLabel="MatchXD Discover" onPress={() => go(`/discover`)}><AppIcon size={42} /></Pressable>}
        <Row style={{ gap: desktop ? 18 : 12 }}>{wallet}<Pressable accessibilityRole="button" accessibilityLabel={dark ? `Switch To Light Mode` : `Switch To Dark Mode`} onPress={() => act({ type: `save-settings`, settings: { theme: dark ? `light` : `dark` } })} style={{ padding: 7 }}><Icon name={dark ? `sun` : `moon`} color={colors.muted} size={21} /></Pressable>{desktop ? <Pressable accessibilityRole="link" accessibilityLabel="My Profile" onPress={() => go(`/profile`)}><Avatar profile={state.user} size={36} /></Pressable> : null}</Row>
      </View>
      <View style={{ flex: 1, minHeight: 0 }}><Slot /></View>
      {!desktop ? <View style={{ gap: 1, paddingTop: 9, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 8, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: `row`, justifyContent: `space-around` }}>{navigation.filter(item => item.path !== `/messages`).map(item => <Pressable key={item.path} accessibilityRole="link" accessibilityLabel={item.label} accessibilityState={{ selected: selected(item) }} onPress={() => go(item.path)} style={{ gap: 5, minHeight: 45, minWidth: 50, alignItems: `center` }}><Icon name={item.icon} color={selected(item) ? colors.accent : colors.muted} size={23} /><Txt size={12} weight={selected(item) ? `semibold` : `regular`} color={selected(item) ? colors.accentText : colors.muted}>{item.label}</Txt></Pressable>)}</View> : null}
    </View>
  </View>;
};
