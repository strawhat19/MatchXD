import { useState } from 'react';
import { router } from 'expo-router';
import { Profile } from '../../domain/types';
import { Icon } from '../../components/Icon';
import { ageOf } from '../../domain/matching';
import { useApp } from '../../state/AppProvider';
import { profileId } from '../../domain/identity';
import { ProfileForm } from '../profile/ProfileForm';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/ProfilePhoto';
import { ConfirmDialog } from '../profile/ConfirmDialog';
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { Txt, Page, Panel, Button, Field, Chip, Row, EmptyState } from '../../components/ui';

const StatusCell = ({ label, status }: { label: string; status: `active` | `inactive` | `danger` }) => {
  const { colors } = useTheme();
  const color = status === `active` ? colors.success : status === `danger` ? colors.danger : colors.muted;
  return <View style={styles.actionsCell}><Row style={styles.rowStatus}><View style={styles.statusDotWrap}><View style={[styles.statusDot, { backgroundColor: color }]} /></View><Txt size={12} style={styles.statusText} color={color}>{label}</Txt></Row></View>;
};

export const DashboardScreen = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { state, act, storageError } = useApp();
  const [query, setQuery] = useState(``);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const [tab, setTab] = useState<`profiles` | `reports` | `activity`>(`profiles`);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(``);
  if (state.session?.role !== `owner`) return <Page title={`Manage MatchXD`} subtitle={`Profiles, reports, and activity in one place.`}><EmptyState icon={`lock`} title={`Management Access`} description={`Sign out and choose Manage MatchXD on the sign-in screen to manage profiles and review saved reports.`} action={<Button label={`Go To Sign-In`} onPress={() => { act({ type: `sign-out` }); router.replace(`/sign-in`); }} />} /></Page>;
  const nextNumber = state.nextProfileNumber;
  const startCreate = () => {
    setCreating(true);
    setEditing({ id: `draft`, number: nextNumber, name: ``, dob: `1996-06-15`, city: `Brooklyn, NY`, bio: ``, job: ``, photos: [`sofia`], distance: 5, interests: [], attributes: {}, links: [], directoryOptIn: false, discoverable: true, incognito: false, likedIds: [], blockedIds: [] });
  };
  const filtered = state.profiles.filter(profile => `${profile.name} ${profile.city} ${profile.job} ${profile.number}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  const openReports = state.reports.filter(report => report.status === `open`).length;
  const bytes = JSON.stringify(state).length * 2;
  const stats = [{ label: `Profiles`, value: state.profiles.length, icon: `users` as const }, { label: `Matches`, value: state.matches.length, icon: `heart` as const }, { label: `Messages`, value: state.messages.length, icon: `message-circle` as const }, { label: `Open Reports`, value: openReports, icon: `flag` as const }];
  if (editing) return <Page title={creating ? `Create Profile` : `Edit ${editing.name}`} subtitle={`Add photos, interests, and details.`}>
    <ProfileForm key={editing.id} profile={editing} admin submitLabel={creating ? `Create Profile` : `Save Changes`} onCancel={() => setEditing(null)} onSave={profile => {
      const saved = creating ? { ...profile, number: nextNumber, id: profileId(nextNumber, profile.name) } : profile;
      const result = act({ type: `admin-save-profile`, profile: saved });
      if (result.ok) { setEditing(null); setCreating(false); }
      else return result.message;
    }} />
  </Page>;
  return <Page title={`The Bigger Picture`} subtitle={`Manage profiles, reports, and activity.`} action={<Button label={`Create Profile`} icon={`plus`} onPress={startCreate} />}>
    <View style={styles.stack}>
      <View style={styles.stats}>{stats.map(stat => <Panel key={stat.label} style={styles.stat}><Icon name={stat.icon} size={20} color={colors.accent} /><Txt size={32} weight={`bold`}>{stat.value}</Txt><Txt size={12} color={colors.muted}>{stat.label}</Txt></Panel>)}</View>
      <Panel style={styles.section}>
        <Row style={styles.spread}><Txt size={20} weight={`semibold`}>Storage & Services</Txt><StatusCell label={storageError ? `Storage Error` : `On-Device Storage`} status={storageError ? `danger` : `active`} /></Row>
        <Txt size={13} color={storageError ? colors.danger : colors.muted}>{storageError || `${(bytes / 1024).toFixed(1)} KB state estimate · ${Platform.OS === `web` ? `Browser localStorage` : `Device AsyncStorage`} · Photos and media are file references`}</Txt>
        <Row style={styles.wrap}><Chip label={`Backend · Not Connected`} /><Chip label={`Payments · Not Connected`} /><Chip label={`Notifications · Not Connected`} /></Row>
        <Txt size={12} color={colors.muted}>XO balance: {state.wallet.daily} daily + {state.wallet.purchased} purchased · {state.wallet.ledger.length} wallet event(s)</Txt>
      </Panel>
      <Row style={styles.wrap}>{([`profiles`, `reports`, `activity`] as const).map(value => <Chip key={value} label={value === `profiles` ? `Profiles` : value === `reports` ? `Reports (${openReports})` : `Activity`} selected={tab === value} onPress={() => setTab(value)} />)}</Row>
      {tab === `profiles` && <Panel style={styles.section}>
        <Field accessibilityLabel={`Search Profiles`} placeholder={`Search by name, city, or profile number…`} value={query} onChangeText={setQuery} />
        {width > 1050 && <Row style={[styles.tableRow, { borderColor: colors.border }]}><Txt style={styles.personColumn} size={12} color={colors.muted}>PROFILE</Txt><Txt style={styles.cityColumn} size={12} color={colors.muted}>LOCATION</Txt><Txt style={styles.statusColumn} size={12} color={colors.muted}>STATUS</Txt><Txt style={styles.actionColumn} size={12} color={colors.muted}>ACTIONS</Txt></Row>}
        {filtered.length ? filtered.map(profile => <View key={profile.id} style={[styles.profileRow, { borderColor: colors.border }, width > 1050 && styles.desktopRow]}>
          <Row style={[styles.person, width > 1050 && styles.personColumn]}><Avatar profile={profile} size={50} /><View style={styles.grow}><Txt weight={`semibold`}>{profile.name}, {ageOf(profile.dob)}</Txt><Txt size={11} color={colors.muted}>Profile #{profile.number}</Txt></View></Row>
          <Txt style={width > 1050 ? styles.cityColumn : undefined} size={13} color={colors.muted}>{profile.city}</Txt>
          <View style={width > 1050 ? styles.statusColumn : undefined}><StatusCell label={profile.discoverable ? profile.incognito ? `Incognito` : `Discoverable` : `Hidden`} status={profile.discoverable ? `active` : `inactive`} /></View>
          <Row style={[styles.wrap, width > 1050 && styles.actionColumn]}><Button label={`Edit`} variant={`secondary`} onPress={() => { setCreating(false); setEditing(profile); }} /><Button label={`Delete`} variant={`ghost`} onPress={() => setDeleting(profile)} /></Row>
        </View>) : <EmptyState icon={`search`} title={`No Profiles Found`} description={`Try a different name or create a profile.`} />}
      </Panel>}
      {tab === `reports` && <Panel style={styles.section}>
        <Txt size={21} weight={`semibold`}>Reports</Txt>
        <Txt size={12} color={colors.muted}>Review saved reports and update their status.</Txt>
        {state.reports.length ? [...state.reports].reverse().map(report => {
          const profile = state.profiles.find(value => value.id === report.profileId);
          return <View key={report.id} style={[styles.report, { borderColor: colors.border }]}>
            <Row style={styles.spread}><Txt weight={`semibold`}>{profile?.name || `Deleted Profile`}</Txt><StatusCell label={report.status === `open` ? `Open` : `Resolved`} status={report.status === `open` ? `danger` : `active`} /></Row>
            <Txt>{report.reason}</Txt><Txt size={11} color={colors.muted}>{new Date(report.at).toLocaleString()}</Txt>
            {report.status === `open` && <Button label={`Mark Resolved`} icon={`check`} variant={`secondary`} onPress={() => act({ type: `resolve-report`, reportId: report.id })} />}
          </View>;
        }) : <EmptyState icon={`check-circle`} title={`All Clear`} description={`Reports made from profiles and conversations will appear here.`} />}
      </Panel>}
      {tab === `activity` && <Panel style={styles.section}>
        <Txt size={21} weight={`semibold`}>Recent Wallet Activity</Txt>
        <Txt size={12} color={colors.muted}>{state.swipes.length} discovery action(s) · {state.blocks.length} blocked profile(s)</Txt>
        {[...state.wallet.ledger].reverse().slice(0, 20).map(entry => <Row key={entry.id} style={[styles.activityRow, { borderColor: colors.border }]}><View style={styles.grow}><Txt weight={`medium`}>{entry.label}</Txt><Txt size={11} color={colors.muted}>{new Date(entry.at).toLocaleString()} · {entry.bucket}</Txt></View><Txt weight={`semibold`} color={entry.amount >= 0 ? colors.success : colors.text}>{entry.amount > 0 ? `+` : ``}{entry.amount} XO</Txt></Row>)}
      </Panel>}
      {!!error && <Txt color={colors.danger}>{error}</Txt>}
    </View>
    <ConfirmDialog visible={!!deleting} title={`Delete ${deleting?.name || `Profile`}?`} description={`This permanently removes the profile and its matches, conversations, reports, directory listing, and discovery history.`} confirmLabel={`Delete Profile`} onCancel={() => setDeleting(null)} onConfirm={() => {
      if (!deleting) return;
      const result = act({ type: `admin-delete-profile`, profileId: deleting.id });
      if (result.ok) setDeleting(null);
      else { setDeleting(null); setError(result.message || `Profile Could Not Be Deleted`); }
    }} />
  </Page>;
};

const styles = StyleSheet.create({
  stack: { gap: 22 },
  grow: { flex: 1 },
  section: { gap: 18, padding: 22 },
  wrap: { flexWrap: `wrap`, gap: 8 },
  statusDot: { height: 7, width: 7, borderRadius: 4 },
  statusText: { flexShrink: 1 },
  actionsCell: { minHeight: 28, justifyContent: `center` },
  rowStatus: { gap: 7 },
  statusDotWrap: { height: 14, width: 14, alignItems: `center`, justifyContent: `center` },
  spread: { justifyContent: `space-between`, gap: 12, flexWrap: `wrap` },
  person: { gap: 12 },
  personColumn: { flex: 1.6 },
  cityColumn: { flex: 1 },
  statusColumn: { flex: 1 },
  actionColumn: { width: 158 },
  desktopRow: { flexDirection: `row`, alignItems: `center` },
  profileRow: { gap: 16, paddingVertical: 18, borderBottomWidth: 1 },
  tableRow: { gap: 16, paddingBottom: 14, borderBottomWidth: 1 },
  report: { gap: 12, paddingVertical: 18, borderBottomWidth: 1 },
  activityRow: { gap: 16, paddingVertical: 14, borderBottomWidth: 1 },
  stats: { gap: 14, flexDirection: `row`, flexWrap: `wrap` },
  stat: { flex: 1, minWidth: 130, padding: 20, gap: 7 },
});
