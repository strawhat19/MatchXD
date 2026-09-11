import { useState } from 'react';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { Profile } from '../../domain/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/ProfilePhoto';
import { visibleProfiles } from '../../domain/matching';
import { Linking, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Chip, EmptyState, Field, Page, Panel, Row, SwitchRow, Txt } from '../../components/ui';

const safeLink = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === `https:` && !url.username && !url.password ? url : null;
  } catch { return null; }
};

const DirectoryCard = ({ profile, onError }: { profile: Profile; onError: (message: string) => void }) => {
  const { colors } = useTheme();
  const links = profile.links.filter(link => safeLink(link.url));
  const openLink = async (value: string) => {
    const url = safeLink(value);
    if (!url) { onError(`This Link Is Unavailable`); return; }
    try { await Linking.openURL(url.toString()); }
    catch { onError(`This Link Could Not Be Opened`); }
  };
  return <Panel style={{ height: `100%`, gap: 17 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${profile.name}'s profile`} onPress={() => router.push(`/people/${profile.id}`)} style={styles.person}>
      <Avatar profile={profile} size={62} /><View style={{ flex: 1, gap: 4 }}><Txt size={18} weight="semibold">{profile.name}</Txt><Txt size={12} color={colors.muted}>{profile.city}</Txt></View><Icon name="arrow-up-right" size={19} color={colors.muted} />
    </Pressable>
    <Txt color={colors.muted}>{profile.bio}</Txt>
    <Row style={{ flexWrap: `wrap` }}>{profile.interests.slice(0, 3).map(interest => <Chip key={interest} label={interest} />)}</Row>
    <View style={{ gap: 9 }}>{links.length ? links.map((link, index) => <Pressable key={`${link.url}_${index}`} accessibilityRole="link" accessibilityLabel={`Open ${profile.name}'s ${link.label}, external website`} onPress={() => { void openLink(link.url); }} style={[styles.link, { borderColor: colors.border, backgroundColor: colors.raised }]}><View style={{ flex: 1 }}><Txt weight="medium" color={colors.accentText}>{link.label}</Txt><Txt size={11} color={colors.muted}>{safeLink(link.url)?.hostname}</Txt></View><Icon name="external-link" size={16} color={colors.accent} /></Pressable>) : <Txt size={12} color={colors.muted}>No public links shared yet</Txt>}</View>
    <Txt size={10} color={colors.muted}>User-Added Links · Ownership Not Verified</Txt>
  </Panel>;
};

export const ProfilerScreen = () => {
  const { state, act } = useApp();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState(``);
  const [notice, setNotice] = useState(``);
  const directory = visibleProfiles(state).filter(profile => profile.directoryOptIn && profile.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  return <Page title="A Little More To Discover" subtitle="Public links, shared by the people behind the profiles.">
    <Panel style={{ gap: 14, backgroundColor: colors.pale }}>
      <Row style={{ flexWrap: `wrap` }}><Icon name="search" size={25} color={colors.accent} /><Txt size={22} weight="bold">Profiler</Txt><Chip label="Opt-In Directory" /></Row>
      <Txt color={colors.muted}>Explore the public links members choose to share in the MatchXD directory.</Txt>
    </Panel>
    <Panel style={{ gap: 12 }}>
      <SwitchRow label="Your Directory Listing" description="Let members who can see your profile find your public links here" value={state.user.directoryOptIn} onValueChange={value => {
        const result = act({ type: `save-user`, profile: { directoryOptIn: value } });
        setNotice(result.message ?? (result.ok ? value ? `Directory Listing Enabled` : `Directory Listing Hidden` : `Setting Could Not Be Saved`));
      }} />
      <Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><Txt size={12} color={colors.muted}>{state.user.links.length} Public Link(s) On Your Profile</Txt><Button label="Manage My Links" icon="edit-2" variant="ghost" onPress={() => router.push(`/profile/edit`)} /></Row>
    </Panel>
    <Field label="Find Someone By Name" accessibilityLabel="Search opt-in directory by name" placeholder="Search the directory…" value={search} onChangeText={setSearch} />
    {notice ? <Panel><Txt color={colors.muted}>{notice}</Txt></Panel> : null}
    <Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><Txt size={18} weight="semibold">{search.trim() ? `Search Results` : `People In The Directory`}</Txt><Txt size={12} color={colors.muted}>{directory.length} Profile(s)</Txt></Row>
    {directory.length ? <View style={styles.grid}>{directory.map(profile => <View key={profile.id} style={{ width: width >= 1150 ? `48.9%` : `100%` }}><DirectoryCard profile={profile} onError={setNotice} /></View>)}</View> : <EmptyState icon="search" title="No Profiles Found" description="Try a different name. Only visible profiles whose members opted in appear here." action={search ? <Button label="Clear Search" variant="secondary" onPress={() => setSearch(``)} /> : undefined} />}
    <Txt size={12} color={colors.muted}>A matching name is not proof of identity. You stay in control of your listing, and you can remove your links at any time.</Txt>
  </Page>;
};

const styles = StyleSheet.create({
  grid: { gap: 18, flexWrap: `wrap`, flexDirection: `row` },
  person: { gap: 12, alignItems: `center`, flexDirection: `row` },
  link: { gap: 10, padding: 13, borderWidth: 1, borderRadius: 12, alignItems: `center`, flexDirection: `row` },
});
