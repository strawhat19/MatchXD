import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { View, ScrollView, Pressable } from 'react-native';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { ageOf } from '../../domain/matching';
import { useApp } from '../../state/AppProvider';
import { INTERESTS } from '../../config/app';
import { AppIcon } from '../../components/BrandMark';
import { useTheme } from '../../theme/ThemeProvider';
import { Txt, Row, Chip, Panel, Field, Button, SwitchRow } from '../../components/ui';

export const OnboardingScreen = () => {
  const { colors } = useTheme();
  const { state, act } = useApp();
  const [name, setName] = useState(state.user.name);
  const [dob, setDob] = useState(``);
  const [photo, setPhoto] = useState(state.user.photos[0] ?? `ethan`);
  const [city, setCity] = useState(state.user.city);
  const [bio, setBio] = useState(state.user.bio);
  const [interests, setInterests] = useState<string[]>(state.user.interests);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(``);
  if (!state.session) return <Redirect href="/sign-in" />;
  if (state.session.onboarded) return <Redirect href="/discover" />;
  const finish = () => {
    if (!name.trim() || !city.trim()) return setError(`Add Your Name And City`);
    if (!Number.isFinite(ageOf(dob)) || ageOf(dob) < 18) return setError(`Enter A Valid Birth Date — You Must Be 18 Or Older`);
    if (!agreed) return setError(`Confirm You Are 18 Or Older To Continue`);
    const photos = [photo, ...state.user.photos.slice(1).filter(item => item !== photo)];
    const result = act({ type: `save-user`, profile: { name: name.trim(), city: city.trim(), dob, bio: bio.trim(), interests, photos }, complete: true });
    if (result.ok) router.replace(`/discover`); else setError(result.message ?? `Profile Could Not Be Saved`);
  };
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, flexGrow: 1 }}><View style={{ gap: 24, maxWidth: 650, alignSelf: `center`, width: `100%`, paddingVertical: 18 }}><Row style={{ justifyContent: `space-between` }}><AppIcon size={48} /><Txt size={12} color={colors.muted}>YOUR PROFILE · 01 / 01</Txt></Row><View><Txt size={33} weight="bold">Start with you.</Txt><Txt color={colors.muted}>A few basics. The rest is a conversation.</Txt></View><Panel><Txt weight="medium">Choose A Profile Photo</Txt><Row style={{ flexWrap: `wrap`, gap: 10 }}>{[`sofia`, `maya`, `elena`, `marcus`, `ethan`, `noah`].map(key => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Choose ${key} Photo`} accessibilityState={{ selected: photo === key }} onPress={() => setPhoto(key)} style={{ width: 70, height: 85, borderRadius: 12, overflow: `hidden`, borderWidth: 3, borderColor: photo === key ? colors.accent : `transparent` }}><ProfilePhoto photo={key} /></Pressable>)}</Row><Field label="First Name" value={name} onChangeText={setName} maxLength={40} autoComplete="given-name" /><Field label="Date Of Birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} maxLength={10} keyboardType="numbers-and-punctuation" /><Txt size={12} color={colors.muted}>Your birth date stays private. Your profile shows your age.</Txt><Field label="City" value={city} onChangeText={setCity} maxLength={80} /><Field label="A Little About You (Optional)" multiline numberOfLines={3} placeholder="A description, in your own words" value={bio} onChangeText={setBio} maxLength={600} /><Txt weight="medium">Your Interests (Optional · Up To 12)</Txt><Row style={{ flexWrap: `wrap`, gap: 8 }}>{INTERESTS.map(interest => <Chip key={interest} label={interest} selected={interests.includes(interest)} onPress={() => setInterests(current => current.includes(interest) ? current.filter(item => item !== interest) : current.length < 12 ? [...current, interest] : current)} />)}</Row><SwitchRow label="I Am 18 Or Older" description="You must be 18 or older to use MatchXD." value={agreed} onValueChange={setAgreed} />{error ? <Txt color={colors.danger} accessibilityRole="alert">{error}</Txt> : null}<Button label="Meet Your People" icon="arrow-right" onPress={finish} /><Txt size={12} color={colors.muted}>You can add more photos and details in Edit Profile.</Txt></Panel><Button label="Back To Sign In" variant="ghost" onPress={() => { act({ type: `sign-out` }); router.replace(`/sign-in`); }} /></View></ScrollView>;
};
