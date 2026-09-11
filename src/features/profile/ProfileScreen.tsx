import { useState } from 'react';
import { router } from 'expo-router';
import { MediaIntro } from './MediaIntro';
import { Icon } from '../../components/Icon';
import { ageOf } from '../../domain/matching';
import { Attribute } from '../../domain/types';
import { useApp } from '../../state/AppProvider';
import { ATTRIBUTE_LABELS } from '../../config/app';
import { useTheme } from '../../theme/ThemeProvider';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { Txt, Page, Panel, Button, Chip, Row } from '../../components/ui';
import { View, Linking, StyleSheet, useWindowDimensions } from 'react-native';

export const ProfileScreen = () => {
  const { state } = useApp();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [linkError, setLinkError] = useState(``);
  const { user } = state;
  const wide = width > 1100;
  return <Page title={`Your Profile`} subtitle={`A little of what makes you, you.`} action={<Button label={`Edit Profile`} icon={`edit-2`} variant={`secondary`} onPress={() => router.push(`/profile/edit`)} />}>
    <View style={[styles.layout, wide && styles.wide]}>
      <View style={[styles.portraitColumn, wide && { flex: 0.85 }]}>
        <Panel style={styles.cover}>
          <ProfilePhoto photo={user.photos?.[0] || `noah`} style={styles.coverPhoto} />
          <View style={styles.coverCopy}>
            <Row style={styles.nameRow}><Txt size={30} weight={`bold`}>{user.name}, {ageOf(user.dob)}</Txt><Icon name={`heart`} color={colors.accent} size={22} /></Row>
            <Row style={styles.line}><Icon name={`map-pin`} size={15} color={colors.muted} /><Txt color={colors.muted}>{user.city}</Txt></Row>
            {!!user.job && <Row style={styles.line}><Icon name={`briefcase`} size={15} color={colors.muted} /><Txt color={colors.muted}>{user.job}</Txt></Row>}
          </View>
        </Panel>
        {user.photos.length > 1 && <Row style={styles.gallery}>{user.photos.slice(1).map((photo, index) => <ProfilePhoto key={`${photo}-${index}`} photo={photo} style={styles.extraPhoto} />)}</Row>}
        <Panel style={styles.visibility}>
          <Icon name={state.settings.incognito ? `eye-off` : `eye`} size={22} color={colors.accent} />
          <View style={styles.grow}><Txt weight={`semibold`}>{!state.settings.discoverable ? `Discovery Paused` : state.settings.incognito ? `Incognito Is On` : `Open To A Connection`}</Txt><Txt size={12} color={colors.muted}>{!state.settings.discoverable ? `Your profile is hidden from discovery` : state.settings.incognito ? `Only people you like can see your profile` : `People can discover your profile`}</Txt></View>
        </Panel>
      </View>
      <View style={styles.detailsColumn}>
        <Panel style={styles.section}><Txt size={21} weight={`semibold`}>About Me</Txt><Txt color={user.bio ? colors.text : colors.muted}>{user.bio || `Your story starts here. Add a short bio to help someone say hello.`}</Txt></Panel>
        <Panel style={styles.section}><Txt size={21} weight={`semibold`}>My Kind Of Things</Txt><Row style={styles.wrap}>{user.interests.length ? user.interests.map(interest => <Chip key={interest} label={interest} selected />) : <Txt color={colors.muted}>Add interests and hobbies to find common ground.</Txt>}</Row></Panel>
        <Panel style={styles.section}>
          <Txt size={21} weight={`semibold`}>The Little Details</Txt>
          {(Object.keys(ATTRIBUTE_LABELS) as Attribute[]).filter(key => key !== `voice` && key !== `video`).map(key => <Row key={key} style={styles.detailRow}><Txt color={colors.muted}>{ATTRIBUTE_LABELS[key]}</Txt><Txt weight={`medium`} style={styles.detailValue}>{user.attributes[key] || `Not Provided`}</Txt></Row>)}
          <Txt size={11} color={colors.muted}>Optional information is self-reported.</Txt>
        </Panel>
        {(!!user.voiceUri || !!user.videoUri) && <Panel style={styles.section}><Txt size={21} weight={`semibold`}>A Little Hello</Txt><MediaIntro voiceUri={user.voiceUri} videoUri={user.videoUri} /></Panel>}
        <Panel style={styles.section}>
          <Row style={styles.spread}><Txt size={21} weight={`semibold`}>Find Me Elsewhere</Txt><Chip label={user.directoryOptIn ? `Directory On` : `Private`} /></Row>
          {user.links.length ? user.links.map((link, index) => <Button key={`${link.url}-${index}`} label={link.label} icon={`external-link`} variant={`secondary`} onPress={() => { setLinkError(``); void Linking.openURL(link.url).catch(() => setLinkError(`This Link Could Not Be Opened`)); }} />) : <Txt color={colors.muted}>Add the public links you want to share in Edit Profile.</Txt>}
          {!!linkError && <Txt size={12} color={colors.danger}>{linkError}</Txt>}
          <Txt size={12} color={colors.muted}>Profiler only shows your links when you opt in and your visibility settings allow it.</Txt>
        </Panel>
      </View>
    </View>
  </Page>;
};

const styles = StyleSheet.create({
  grow: { flex: 1, gap: 5 },
  wide: { flexDirection: `row`, alignItems: `flex-start` },
  layout: { gap: 24, marginBottom: 24 },
  wrap: { flexWrap: `wrap`, gap: 8 },
  portraitColumn: { gap: 16 },
  detailsColumn: { flex: 1, gap: 20 },
  cover: { padding: 0, overflow: `hidden` },
  coverPhoto: { width: `100%`, height: 390 },
  coverCopy: { padding: 24, gap: 9 },
  line: { gap: 8 },
  nameRow: { gap: 12, flexWrap: `wrap` },
  gallery: { gap: 10, flexWrap: `wrap` },
  extraPhoto: { width: 91, height: 118, borderRadius: 16 },
  section: { padding: 22, gap: 16 },
  spread: { justifyContent: `space-between`, flexWrap: `wrap`, gap: 10 },
  detailRow: { justifyContent: `space-between`, gap: 16, paddingVertical: 4 },
  detailValue: { flex: 1, textAlign: `right` },
  visibility: { flexDirection: `row`, gap: 14, padding: 20, alignItems: `center` },
});
