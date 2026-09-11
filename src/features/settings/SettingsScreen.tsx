import { useState } from 'react';
import { router } from 'expo-router';
import { hasTier } from '../../config/plans';
import { Icon } from '../../components/Icon';
import { ThemeMode } from '../../domain/types';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../../state/AppProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/ProfilePhoto';
import { ConfirmDialog } from '../profile/ConfirmDialog';
import { Txt, Page, Panel, Button, Chip, Row, SwitchRow } from '../../components/ui';

export const SettingsScreen = () => {
  const { colors } = useTheme();
  const { state, act, storageError } = useApp();
  const [confirm, setConfirm] = useState<`reset` | `delete-account` | null>(null);
  const blockedProfiles = state.profiles.filter(profile => state.blocks.includes(profile.id));
  const incognitoAvailable = hasTier(state.wallet.plan, `mxd`);
  const destroy = () => {
    if (!confirm) return;
    const result = act({ type: confirm });
    if (result.ok) { setConfirm(null); router.replace(`/`); }
  };
  return <Page title={`Make Yourself At Home`} subtitle={`Your experience. Your privacy. Your choice.`}>
    <View style={styles.stack}>
      <Panel style={styles.section}>
        <Row style={styles.heading}><Icon name={`sun`} color={colors.accent} size={22} /><Txt size={21} weight={`semibold`}>Appearance</Txt></Row>
        <Txt color={colors.muted}>Coral by day. A little After Hours by night.</Txt>
        <Row style={styles.wrap}>{([`light`, `dark`, `system`] as ThemeMode[]).map(theme => <Chip key={theme} label={theme.charAt(0).toUpperCase() + theme.slice(1)} selected={state.settings.theme === theme} onPress={() => act({ type: `save-settings`, settings: { theme } })} />)}</Row>
      </Panel>
      <Panel style={styles.section}>
        <Row style={styles.heading}><Icon name={`shield`} color={colors.accent} size={22} /><Txt size={21} weight={`semibold`}>Your Visibility</Txt></Row>
        <SwitchRow label={`Show Me In Discovery`} description={`Turn off to hide your profile throughout member discovery and search`} value={state.settings.discoverable} onValueChange={discoverable => act({ type: `save-settings`, settings: { discoverable } })} />
        {incognitoAvailable ? <SwitchRow label={`Incognito Mode`} description={`Only people you like can see you. Blocks always take priority.`} value={state.settings.incognito} onValueChange={incognito => act({ type: `save-settings`, settings: { incognito } })} /> : <View style={styles.locked}><Row style={styles.spread}><Txt weight={`semibold`}>Incognito Mode</Txt><Chip label={`MXD`} /></Row><Txt size={13} color={colors.muted}>Choose who gets to see you. Incognito is available with MXD.</Txt><Button label={`Explore Plans`} icon={`arrow-up-right`} variant={`secondary`} onPress={() => router.push(`/wallet`)} /></View>}
        <Button label={`Edit Public Directory Links`} icon={`external-link`} variant={`ghost`} onPress={() => router.push(`/profile/edit`)} />
      </Panel>
      <Panel style={styles.section}>
        <Row style={styles.heading}><Icon name={`bell`} color={colors.accent} size={22} /><Txt size={21} weight={`semibold`}>Notifications</Txt></Row>
        <Txt size={13} color={colors.muted}>Your preferences are saved. Notification delivery is not connected yet.</Txt>
        {([{ key: `push`, label: `Push Notifications`, description: `A new match or a thoughtful hello` }, { key: `email`, label: `Email Updates`, description: `Occasional account and connection updates` }, { key: `sms`, label: `Text Messages`, description: `Optional updates by SMS` }] as const).map(({ key, label, description }) => <SwitchRow key={key} label={label} description={description} value={state.settings.notifications[key]} onValueChange={value => act({ type: `save-settings`, settings: { notifications: { ...state.settings.notifications, [key]: value } } })} />)}
      </Panel>
      <Panel style={styles.section}>
        <Row style={styles.heading}><Icon name={`slash`} color={colors.accent} size={22} /><Txt size={21} weight={`semibold`}>Blocked Profiles</Txt></Row>
        <Txt size={13} color={colors.muted}>Blocked profiles cannot see or contact each other. Unblocking does not restore an old match or conversation.</Txt>
        {blockedProfiles.length ? blockedProfiles.map(profile => <Row key={profile.id} style={styles.blockRow}><Avatar profile={profile} size={48} /><View style={styles.grow}><Txt weight={`semibold`}>{profile.name}</Txt><Txt size={12} color={colors.muted}>{profile.city}</Txt></View><Button label={`Unblock`} variant={`secondary`} onPress={() => act({ type: `unblock`, profileId: profile.id })} /></Row>) : <Txt color={colors.muted}>Your blocklist is empty.</Txt>}
        <Button label={`Manage Excluded Names`} variant={`ghost`} icon={`sliders`} onPress={() => router.push(`/preferences`)} />
      </Panel>
      <Panel style={styles.section}>
        <Row style={styles.heading}><Icon name={`hard-drive`} color={colors.accent} size={22} /><Txt size={21} weight={`semibold`}>Your Account</Txt></Row>
        <Txt color={storageError ? colors.danger : colors.muted}>{storageError || `Your account data is saved on this device. Cross-device sync is not available yet.`}</Txt>
        {state.session?.role === `owner` && <Button label={`Manage MatchXD`} icon={`grid`} variant={`secondary`} onPress={() => router.push(`/dashboard`)} />}
        <Button label={`Sign Out`} icon={`log-out`} variant={`secondary`} onPress={() => { act({ type: `sign-out` }); router.replace(`/sign-in`); }} />
      </Panel>
      <Panel style={[styles.section, { borderColor: colors.danger }]}>
        <Txt size={21} weight={`semibold`}>Start Fresh</Txt>
        <Txt color={colors.muted}>Reset your activity or delete your account data. These actions cannot be undone.</Txt>
        <Row style={styles.wrap}><Button label={`Reset App Data`} variant={`secondary`} icon={`refresh-cw`} onPress={() => setConfirm(`reset`)} /><Button label={`Delete Account Data`} variant={`danger`} icon={`trash-2`} onPress={() => setConfirm(`delete-account`)} /></Row>
      </Panel>
    </View>
    <ConfirmDialog visible={!!confirm} title={confirm === `reset` ? `Reset App Data?` : `Delete Your Account Data?`} description={confirm === `reset` ? `This clears your profile edits, matches, messages, reports, and wallet history and restores the starting profiles.` : `This erases your profile and its activity from this device.`} confirmLabel={confirm === `reset` ? `Reset Data` : `Delete Data`} onCancel={() => setConfirm(null)} onConfirm={destroy} />
  </Page>;
};

const styles = StyleSheet.create({
  stack: { gap: 20 },
  grow: { flex: 1, gap: 3 },
  wrap: { gap: 10, flexWrap: `wrap` },
  heading: { gap: 12, flexWrap: `wrap` },
  section: { padding: 22, gap: 17 },
  locked: { gap: 12, paddingVertical: 12 },
  spread: { justifyContent: `space-between`, gap: 12 },
  blockRow: { gap: 12, paddingVertical: 8, flexWrap: `wrap` },
});
