import { router, usePathname } from 'expo-router';
import { View, Pressable } from 'react-native';
import { useApp } from '../../state/AppProvider';
import { Icon } from '../../components/Icon';
import { Txt, Row } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { useNavigationPreference } from '../../shared/readiness/useNavigationPreference';

export const AccountNavigation = () => {
  const path = usePathname();
  const { state } = useApp();
  const { colors } = useTheme();
  const { expanded, ready, error, toggle } = useNavigationPreference();
  const links = [
    { label: `Profile`, path: `/profile` },
    { label: `Connections`, path: `/connections` },
    { label: `Settings`, path: `/settings` },
    ...(state.session?.role === `owner` ? [
      { label: `Demo dashboard`, path: `/dashboard` },
      { label: `Analytics preview`, path: `/analytics` },
    ] : []),
  ];
  return <View nativeID={`matchxd-account-navigation`} style={{ gap: 8 }}>
    <Pressable disabled={!ready} accessibilityRole={`button`} accessibilityState={{ expanded, disabled: !ready }} accessibilityLabel={`Toggle account navigation`} onPress={toggle} style={{ paddingVertical: 12 }}><Row><Icon name={`user`} size={18} /><Txt size={12} weight={`semibold`}>ACCOUNT / DEMO TOOLS</Txt><Icon name={expanded ? `chevron-up` : `chevron-down`} size={16} /></Row></Pressable>
    {expanded && links.map(link => <Pressable key={link.path} nativeID={`account-${link.path.slice(1)}`} accessibilityRole={`link`} accessibilityState={{ selected: path === link.path }} onPress={() => router.push(link.path as never)} style={{ padding: 10, borderRadius: 8, backgroundColor: path === link.path ? colors.pale : colors.raised }}><Txt size={13}>{link.label}</Txt></Pressable>)}
    {!!error && <Txt size={11} color={colors.danger}>{error}</Txt>}
  </View>;
};
