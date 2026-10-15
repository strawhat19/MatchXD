import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Page, Panel, Txt, Button } from '../../components/ui';

export const ConnectionsScreen = () => {
  const { colors } = useTheme();
  return <Page title={`Account Connections`} subtitle={`Device-only preview. No online account is connected.`}>
    <View nativeID={`matchxd-connections`} style={{ gap: 20 }}>
      {[`Google sign-in`, `Email and password`, `Cloud Firestore sync`].map((label, index) => <Panel key={label}><View nativeID={`connection-${index}`} style={{ gap: 12 }}><Txt size={20} weight={`semibold`}>{label}</Txt><Txt color={colors.muted}>Not connected. No credentials are requested or stored.</Txt><Button label={`Setup Required`} icon={`lock`} disabled onPress={() => undefined} /></View></Panel>)}
      <Panel><Txt>Future account export and deletion</Txt><Txt color={colors.muted}>Cloud actions require authenticated services. Current device data can be managed in Settings. Clearing local storage is not a cloud deletion request.</Txt></Panel>
    </View>
  </Page>;
};
