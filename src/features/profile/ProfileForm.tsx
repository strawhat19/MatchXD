import { useRef, useState } from 'react';
import { MediaIntro } from './MediaIntro';
import { ageOf } from '../../domain/matching';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeProvider';
import * as DocumentPicker from 'expo-document-picker';
import { Profile, Attribute } from '../../domain/types';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { View, Platform, Pressable, StyleSheet } from 'react-native';
import { OPTIONS, INTERESTS, ATTRIBUTE_LABELS } from '../../config/app';
import { Txt, Button, Panel, Field, Chip, Row, SwitchRow } from '../../components/ui';

const samplePhotos = [`sofia`, `maya`, `elena`, `marcus`, `ethan`, `noah`];
const editableAttributes = (Object.keys(OPTIONS) as Attribute[]).filter(key => key !== `voice` && key !== `video`);

export const validateProfile = (profile: Profile) => {
  if (!profile.name.trim()) return `Add Your Name`;
  if (!Number.isFinite(ageOf(profile.dob)) || ageOf(profile.dob) < 18) return `Enter A Valid Date Of Birth — You Must Be 18 Or Older`;
  if (!profile.city.trim()) return `Add Your City`;
  if (!profile.photos.length) return `Add At Least One Photo`;
  if (profile.links.some(link => {
    try { const url = new URL(link.url); return !link.label.trim() || url.protocol !== `https:` || !url.hostname.includes(`.`) || !!url.username || !!url.password; }
    catch { return true; }
  })) return `Give Every Public Link A Label And Valid HTTPS Address`;
  return ``;
};

type Props = { profile: Profile; submitLabel?: string; onSave: (profile: Profile) => string | void; onCancel?: () => void; admin?: boolean };

export const ProfileForm = ({ profile, onSave, onCancel, admin, submitLabel = `Save Profile` }: Props) => {
  const { colors } = useTheme();
  const saving = useRef(false);
  const [draft, setDraft] = useState<Profile>({ ...profile, attributes: { ...profile.attributes }, photos: [...profile.photos], links: [...profile.links] });
  const [error, setError] = useState(``);
  const [busy, setBusy] = useState(false);
  const [newInterest, setNewInterest] = useState(``);
  const update = (change: Partial<Profile>) => setDraft(current => ({ ...current, ...change }));
  const changePhotoOrder = (index: number, offset: number) => {
    const photos = [...draft.photos];
    [photos[index], photos[index + offset]] = [photos[index + offset], photos[index]];
    update({ photos });
  };
  const selectPhoto = async () => {
    setBusy(true);
    setError(``);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: [`images`], quality: 0.85, allowsEditing: true, aspect: [4, 5] });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) update({ photos: [...draft.photos, uri].slice(0, 6) });
    } catch { setError(`Photo Could Not Be Opened — Try Another File`); }
    finally { setBusy(false); }
  };
  const selectMedia = async (kind: `voice` | `video`) => {
    setBusy(true);
    setError(``);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: kind === `voice` ? `audio/*` : `video/*`, copyToCacheDirectory: true });
      const file = result.assets?.[0];
      if (!result.canceled && file?.uri) {
        if (file.size && file.size > 25 * 1024 * 1024) { setError(`Choose A File Smaller Than 25 MB`); return; }
        update(kind === `voice` ? { voiceUri: file.uri } : { videoUri: file.uri });
      }
    } catch { setError(`Media Could Not Be Opened — Try Another File`); }
    finally { setBusy(false); }
  };
  const save = () => {
    if (saving.current || busy) return;
    const clean = { ...draft, bio: draft.bio.trim(), job: draft.job.trim(), name: draft.name.trim(), city: draft.city.trim(), attributes: Object.fromEntries(Object.entries(draft.attributes).filter(([, value]) => !!value)), interests: draft.interests.map(value => value.trim()).filter(Boolean), links: draft.links.map(link => ({ label: link.label.trim(), url: link.url.trim() })) };
    const problem = validateProfile(clean);
    if (problem) { setError(problem); return; }
    saving.current = true;
    setBusy(true);
    const result = onSave(clean);
    if (result) { setError(result); saving.current = false; setBusy(false); }
  };
  return <View style={styles.stack}>
    <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>Your Best First Impression</Txt>
      <Txt color={colors.muted}>Lead with your favorite photo. Add up to six, and arrange them your way.</Txt>
      <View style={styles.photos}>
        {draft.photos.map((photo, index) => <View key={`${photo}-${index}`} style={styles.photoTile}>
          <ProfilePhoto photo={photo} style={styles.photo} />
          <View style={[styles.photoNumber, { backgroundColor: colors.surface }]}><Txt size={11} weight={`bold`}>{index === 0 ? `Cover` : `${index + 1}`}</Txt></View>
          <Row style={styles.photoActions}>
            <Pressable accessibilityRole={`button`} accessibilityLabel={`Move Photo ${index + 1} Earlier`} disabled={!index} onPress={() => changePhotoOrder(index, -1)} style={[styles.miniButton, { backgroundColor: colors.raised, opacity: index ? 1 : 0.35 }]}><Txt>←</Txt></Pressable>
            <Pressable accessibilityRole={`button`} accessibilityLabel={`Remove Photo ${index + 1}`} onPress={() => update({ photos: draft.photos.filter((_, i) => i !== index) })} style={[styles.miniButton, { backgroundColor: colors.raised }]}><Txt color={colors.danger}>×</Txt></Pressable>
            <Pressable accessibilityRole={`button`} accessibilityLabel={`Move Photo ${index + 1} Later`} disabled={index === draft.photos.length - 1} onPress={() => changePhotoOrder(index, 1)} style={[styles.miniButton, { backgroundColor: colors.raised, opacity: index === draft.photos.length - 1 ? 0.35 : 1 }]}><Txt>→</Txt></Pressable>
          </Row>
        </View>)}
      </View>
      <Button label={busy ? `Opening…` : `Choose A Photo`} icon={`image`} variant={`secondary`} disabled={busy || draft.photos.length >= 6} onPress={() => void selectPhoto()} />
      <Txt size={12} color={colors.muted}>Or choose a portrait:</Txt>
      <Row style={styles.wrap}>{samplePhotos.map(photo => <Chip key={photo} label={photo.charAt(0).toUpperCase() + photo.slice(1)} selected={draft.photos.includes(photo)} disabled={draft.photos.includes(photo) || draft.photos.length >= 6} onPress={() => update({ photos: [...draft.photos, photo] })} />)}</Row>
      {Platform.OS === `web` && <Txt size={12} color={colors.muted}>Uploaded photos and media last for this browser session. Select them again after a reload; built-in portraits and introductions stay saved.</Txt>}
    </Panel>
    <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>The Essentials</Txt>
      <View style={styles.fields}>
        <View style={styles.column}><Field label={`First Name`} value={draft.name} onChangeText={name => update({ name })} maxLength={40} autoCapitalize={`words`} /></View>
        <View style={styles.column}><Field label={`Date Of Birth · YYYY-MM-DD`} value={draft.dob} onChangeText={dob => update({ dob })} placeholder={`1997-06-15`} maxLength={10} /></View>
      </View>
      <View style={styles.fields}>
        <View style={styles.column}><Field label={`City`} value={draft.city} onChangeText={city => update({ city })} placeholder={`Brooklyn, NY`} maxLength={80} /></View>
        <View style={styles.column}><Field label={`Work · Optional`} value={draft.job} onChangeText={job => update({ job })} placeholder={`What keeps you inspired?`} maxLength={80} /></View>
      </View>
      <Txt size={12} color={colors.muted}>Only your age and city appear on your profile. Exact location and birthday stay private.</Txt>
      <Field label={`About You`} value={draft.bio} onChangeText={bio => update({ bio })} placeholder={`A little of what makes you, you.`} multiline maxLength={600} style={styles.bio} />
      <Txt size={12} color={colors.muted}>{draft.bio.length}/600</Txt>
    </Panel>
    <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>Interests & Hobbies</Txt>
      <Txt color={colors.muted}>Choose up to 12 things you love.</Txt>
      <Row style={styles.wrap}>{[...new Set([...INTERESTS, ...draft.interests])].map(interest => <Chip key={interest} label={interest} selected={draft.interests.includes(interest)} disabled={!draft.interests.includes(interest) && draft.interests.length >= 12} onPress={() => update({ interests: draft.interests.includes(interest) ? draft.interests.filter(value => value !== interest) : [...draft.interests, interest] })} />)}</Row>
      <View style={styles.interestInput}><View style={styles.grow}><Field label={`Add Your Own`} value={newInterest} maxLength={30} onChangeText={setNewInterest} placeholder={`Pottery, tennis, stargazing…`} /></View><Button label={`Add`} variant={`secondary`} disabled={!newInterest.trim() || draft.interests.length >= 12} onPress={() => { update({ interests: [...new Set([...draft.interests, newInterest.trim()])] }); setNewInterest(``); }} /></View>
    </Panel>
    <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>A Little More About You</Txt>
      <Txt color={colors.muted}>Every detail is optional. Share what feels right.</Txt>
      {editableAttributes.map(attribute => <View key={attribute} style={styles.attribute}>
        <Txt weight={`medium`}>{ATTRIBUTE_LABELS[attribute]}{attribute === `height` ? ` · Self-Reported` : ``}</Txt>
        <Row style={styles.wrap}>
          <Chip label={`Not Provided`} selected={!draft.attributes[attribute]} onPress={() => update({ attributes: { ...draft.attributes, [attribute]: undefined } })} />
          {OPTIONS[attribute].map(option => <Chip key={option} label={option} selected={draft.attributes[attribute] === option} onPress={() => update({ attributes: { ...draft.attributes, [attribute]: option } })} />)}
        </Row>
      </View>)}
    </Panel>
    <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>More Than A Photo</Txt>
      <Txt color={colors.muted}>An optional voice or video introduction. Add your own or try an example.</Txt>
      <Row style={styles.wrap}><Button label={`Add Voice`} icon={`mic`} variant={`secondary`} disabled={busy} onPress={() => void selectMedia(`voice`)} /><Button label={`Add Video`} icon={`video`} variant={`secondary`} disabled={busy} onPress={() => void selectMedia(`video`)} /></Row>
      <Row style={styles.wrap}><Chip label={`Try Voice Example`} onPress={() => update({ voiceUri: `demo:voice` })} /><Chip label={`Try Video Example`} onPress={() => update({ videoUri: `demo:video` })} /></Row>
      <MediaIntro voiceUri={draft.voiceUri} videoUri={draft.videoUri} />
      <Row style={styles.wrap}>{!!draft.voiceUri && <Button label={`Remove Voice`} variant={`ghost`} onPress={() => update({ voiceUri: undefined })} />}{!!draft.videoUri && <Button label={`Remove Video`} variant={`ghost`} onPress={() => update({ videoUri: undefined })} />}</Row>
      <Txt size={12} color={colors.muted}>Files stay on this device and may need to be selected again if its storage is cleared.</Txt>
    </Panel>
    <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>Your Public Links</Txt>
      <SwitchRow label={`Appear In Profiler`} description={`Let people find the public links you choose to share`} value={draft.directoryOptIn} onValueChange={directoryOptIn => update({ directoryOptIn })} />
      <Txt color={colors.muted}>Only links you add appear in the opt-in directory. They do not verify identity.</Txt>
      {draft.links.map((link, index) => <View key={index} style={styles.linkFields}>
        <Field label={`Link ${index + 1} · Label`} value={link.label} maxLength={40} placeholder={`Instagram, portfolio…`} onChangeText={label => update({ links: draft.links.map((value, i) => i === index ? { ...value, label } : value) })} />
        <Field label={`HTTPS Address`} value={link.url} maxLength={500} autoCapitalize={`none`} autoCorrect={false} keyboardType={`url`} placeholder={`https://example.com/your-profile`} onChangeText={url => update({ links: draft.links.map((value, i) => i === index ? { ...value, url } : value) })} />
        <Button label={`Remove Link`} variant={`ghost`} onPress={() => update({ links: draft.links.filter((_, i) => i !== index) })} />
      </View>)}
      <Button label={`Add Public Link`} icon={`plus`} variant={`secondary`} disabled={draft.links.length >= 5} onPress={() => update({ links: [...draft.links, { label: ``, url: `` }] })} />
    </Panel>
    {admin && <Panel style={styles.section}>
      <Txt size={21} weight={`semibold`}>Profile Visibility</Txt>
      <SwitchRow label={`Discoverable`} value={draft.discoverable} onValueChange={discoverable => update({ discoverable })} />
      <SwitchRow label={`Incognito`} description={`Visible only to members this profile has liked`} value={draft.incognito} onValueChange={incognito => update({ incognito })} />
      <Field label={`Approximate Distance · Miles`} value={`${draft.distance}`} keyboardType={`number-pad`} onChangeText={value => update({ distance: Math.min(500, Math.max(0, Number(value.replace(/[^0-9]/g, ``)))) })} />
    </Panel>}
    {!!error && <Panel style={[styles.error, { borderColor: colors.danger }]}><Txt color={colors.danger}>{error}</Txt></Panel>}
    <Row style={styles.footer}>{onCancel && <Button label={`Cancel`} variant={`secondary`} onPress={onCancel} />}<Button label={submitLabel} icon={`check`} disabled={busy} onPress={save} /></Row>
  </View>;
};

const styles = StyleSheet.create({
  grow: { flex: 1 },
  stack: { gap: 20 },
  bio: { minHeight: 120, textAlignVertical: `top` },
  attribute: { gap: 10, paddingVertical: 9 },
  wrap: { gap: 8, flexWrap: `wrap` },
  footer: { justifyContent: `flex-end`, gap: 12, paddingVertical: 10 },
  error: { borderWidth: 1, padding: 18 },
  column: { flex: 1, minWidth: 210 },
  fields: { flexDirection: `row`, flexWrap: `wrap`, gap: 16 },
  photos: { gap: 14, flexDirection: `row`, flexWrap: `wrap` },
  section: { padding: 22, gap: 16 },
  linkFields: { gap: 10, paddingTop: 10 },
  photoTile: { width: 138, gap: 7 },
  photo: { height: 168, width: 138, borderRadius: 16 },
  photoActions: { gap: 4, justifyContent: `space-between` },
  photoNumber: { top: 9, left: 9, position: `absolute`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  miniButton: { width: 43, height: 36, justifyContent: `center`, alignItems: `center`, borderRadius: 9 },
  interestInput: { gap: 12, flexDirection: `row`, alignItems: `flex-end` },
});
