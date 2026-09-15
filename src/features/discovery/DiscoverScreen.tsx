import { useState } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Icon } from '../../components/Icon';
import { ECONOMY } from '../../config/economy';
import { PLAN_LIMITS } from '../../config/plans';
import { useApp } from '../../state/AppProvider';
import { MediaIntro } from '../profile/MediaIntro';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { ConnectedX } from '../../components/BrandMark';
import { SymbolIcon } from '../../components/SymbolIcon';
import type { AppState, Profile, Swipe } from '../../domain/types';
import { Avatar, ProfilePhoto } from '../../components/ProfilePhoto';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { introductionAvailability, remainingDailyAction } from '../../domain/quotas';
import { View, Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Txt, Row, Chip, Panel, Field, Button, EmptyState } from '../../components/ui';
import { ageOf, visibleProfiles, discoveryProfiles, canViewProfile } from '../../domain/matching';
import Animated, { runOnJS, withSpring, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const haptic = () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined); };

const SafetyDialog = ({ profile, close }: { profile: Profile; close: () => void }) => {
  const { act } = useApp();
  const { colors } = useTheme();
  const [reason, setReason] = useState(``);
  return <Modal visible transparent animationType="fade" onRequestClose={close}><View style={{ flex: 1, padding: 24, justifyContent: `center`, alignItems: `center`, backgroundColor: `rgba(0,0,0,.65)` }}><Panel style={{ width: `100%`, maxWidth: 440 }}><Row style={{ justifyContent: `space-between` }}><Txt size={21} weight="semibold">Your Comfort Comes First</Txt><Pressable accessibilityRole="button" accessibilityLabel="Close Safety Options" onPress={close} style={{ padding: 9 }}><Icon name="x" /></Pressable></Row><Txt color={colors.muted}>Block {profile.name} to hide your profiles from each other. Safety actions never cost XOs.</Txt><Button label={`Block ${profile.name}`} icon="slash" variant="danger" onPress={() => { act({ type: `block`, profileId: profile.id }); close(); }} /><View style={{ height: 1, backgroundColor: colors.border }} /><Field label="Report A Concern" placeholder="What would you like us to know?" value={reason} onChangeText={setReason} multiline maxLength={500} /><Button label="Save Report" variant="secondary" disabled={!reason.trim()} onPress={() => { act({ type: `report`, profileId: profile.id, reason: reason.trim() }); close(); }} /><Txt size={12} color={colors.muted}>Reports are saved on this device for review in Manage MatchXD.</Txt></Panel></View></Modal>;
};

const canRewindSwipe = (state: AppState) => {
  const last = state.swipes.at(-1);
  const profile = state.profiles.find(item => item.id === last?.profileId);
  return !!profile && canViewProfile(state, profile) && !state.matches.includes(profile.id) && remainingDailyAction(state, `rewind`) > 0;
};

const MessageProfileAction = ({ profile }: { profile: Profile }) => {
  const { state } = useApp();
  const { colors } = useTheme();
  const matched = state.matches.includes(profile.id);
  const introduced = state.introductions?.some(item => item.profileId === profile.id);
  const introduction = introductionAvailability(state, profile.id);
  const hasThread = state.messages.some(message => message.profileId === profile.id);
  const waiting = !matched && introduced && hasThread;
  const contactEnded = !matched && (introduced ? !hasThread : state.contactHistory?.includes(profile.id));
  const label = matched ? `Message ${profile.name}` : waiting ? `View First Message` : contactEnded ? `A New Match Is Needed` : `First Message — ${ECONOMY.costs.firstMessage} XO`;
  return <View style={{ gap: 8 }}><Button label={label} icon="message-circle" variant="secondary" disabled={!!contactEnded} onPress={() => router.push(`/messages/${profile.id}` as never)} /><Txt size={12} color={colors.muted}>{matched ? `You matched. Keep the conversation going for free.` : waiting ? `First message sent. Chat opens after a mutual match.` : contactEnded ? `This conversation has ended. A new mutual match is needed to message again.` : `${introduction.remaining} of ${PLAN_LIMITS[state.wallet.plan].firstMessage} first messages left today · One per person before matching`}</Txt>{!matched && !waiting && !contactEnded && !introduction.available ? <Txt size={11} color={colors.muted}>{introduction.reason}</Txt> : null}</View>;
};

export const ProfileDetails = ({ profile, onLike, onSafety }: { profile: Profile; onLike?: () => void; onSafety: () => void }) => {
  const { colors } = useTheme();
  return <Panel style={{ gap: 22 }}><Row style={{ justifyContent: `space-between`, alignItems: `flex-start` }}><View style={{ flex: 1 }}><Txt size={28} weight="bold" style={{ letterSpacing: -.8 }}>{profile.name}, {ageOf(profile.dob)}</Txt><Row style={{ gap: 6, marginTop: 4 }}><Icon name="map-pin" size={15} color={colors.muted} /><Txt size={13} color={colors.muted}>{profile.city} · {profile.distance} miles away</Txt></Row></View><Pressable accessibilityRole="button" accessibilityLabel={`Safety Options For ${profile.name}`} onPress={onSafety} style={{ padding: 6 }}><Icon name="more-horizontal" color={colors.muted} /></Pressable></Row><Txt size={15} color={colors.muted} style={{ lineHeight: 26 }}>{profile.bio || `A little mystery. Say hello and get to know ${profile.name}.`}</Txt>{profile.job ? <Row><Icon name="briefcase" color={colors.muted} size={17} /><Txt size={13} color={colors.muted}>{profile.job}</Txt></Row> : null}<View style={{ height: 1, backgroundColor: colors.border }} /><View style={{ gap: 12 }}><Txt size={12} color={colors.muted} weight="semibold" style={{ letterSpacing: 1.2 }}>A FEW FAVORITE THINGS</Txt><Row style={{ flexWrap: `wrap`, gap: 8 }}>{profile.interests.map(interest => <Chip key={interest} label={interest} />)}</Row></View>{Object.entries(profile.attributes).filter(([key, value]) => ![`voice`, `video`].includes(key) && value && value !== `Not Provided`).length ? <View style={{ gap: 8 }}>{Object.entries(profile.attributes).filter(([key, value]) => ![`voice`, `video`].includes(key) && value && value !== `Not Provided`).map(([key, value]) => <Row key={key} style={{ justifyContent: `space-between` }}><Txt size={12} color={colors.muted} style={{ textTransform: `capitalize` }}>{key === `ethnicity` ? `Race / Ethnicity` : key}</Txt><Txt size={13}>{value}{key === `height` ? ` · Self-Reported` : ``}</Txt></Row>)}</View> : null}<MediaIntro voiceUri={profile.voiceUri} videoUri={profile.videoUri} />{onLike ? <Button label={`Like ${profile.name}`} icon="heart" onPress={onLike} /> : null}</Panel>;
};

const RoundAction = ({ label, onPress, children, primary, disabled }: { label: string; onPress: () => void; children: React.ReactNode; primary?: boolean; disabled?: boolean }) => {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ width: primary ? 74 : 59, height: primary ? 74 : 59, borderRadius: 45, borderWidth: primary ? 0 : 1, borderColor: colors.border, justifyContent: `center`, alignItems: `center`, backgroundColor: primary ? colors.accent : colors.surface, opacity: disabled ? .4 : pressed ? .65 : 1, transform: [{ scale: pressed ? .96 : 1 }] })}>{children}</Pressable>;
};

const SwipeCard = ({ profile, onMatch, onSafety }: { profile: Profile; onMatch: (id: string) => void; onSafety: () => void }) => {
  const { state, act } = useApp();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const rewindRemaining = remainingDailyAction(state, `rewind`);
  const superRemaining = remainingDailyAction(state, `super`);
  const limits = PLAN_LIMITS[state.wallet.plan];
  const locked = useSharedValue(false);
  const x = useSharedValue(0);
  const cardHeight = width >= 900 ? Math.min(560, Math.max(440, height - 270)) : Math.min(510, Math.max(260, height - 394));
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }, { rotate: `${x.get() / 28}deg` }] }));
  const commit = (kind: Swipe[`kind`]) => {
    const result = act({ type: `swipe`, profileId: profile.id, kind });
    x.set(0);
    locked.set(false);
    setBusy(false);
    if (result.matchId) onMatch(result.matchId);
  };
  const choose = (kind: Swipe[`kind`]) => {
    if (locked.get()) return;
    if (state.wallet.daily + state.wallet.purchased < ECONOMY.costs[kind] || (kind === `super` && !superRemaining)) { x.set(withSpring(0, { damping: 20, stiffness: 220 })); act({ type: `swipe`, profileId: profile.id, kind }); return; }
    locked.set(true);
    setBusy(true);
    haptic();
    x.set(withTiming(kind === `pass` ? -600 : 600, { duration: 190 }, finished => { if (finished) runOnJS(commit)(kind); }));
  };
  const pan = Gesture.Pan().enabled(!busy).activeOffsetX([-15, 15]).failOffsetY([-25, 25]).onUpdate(event => { x.set(event.translationX); }).onEnd(event => {
    if (Math.abs(event.translationX) > 90 || Math.abs(event.velocityX) > 850) runOnJS(choose)(event.translationX > 0 ? `like` : `pass`);
    else x.set(withSpring(0, { damping: 20, stiffness: 220 }));
  });
  return <View style={{ gap: 21, width: `100%`, maxWidth: 490, alignSelf: `center` }}>
    <GestureDetector gesture={pan}><Animated.View style={[{ height: cardHeight, borderRadius: 22, overflow: `hidden`, backgroundColor: colors.surface }, animatedStyle]}>
      <ProfilePhoto photo={profile.photos?.[photoIndex] ?? profile.photos?.[0]} />
      <LinearGradient colors={[`transparent`, `rgba(13,15,22,.92)`]} style={{ position: `absolute`, bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 23, paddingTop: 110, gap: 9 }}>
        <Txt color="#FFFFFF" size={31} weight="bold" style={{ letterSpacing: -.6 }}>{profile.name}, {ageOf(profile.dob)}</Txt><Row style={{ gap: 6 }}><Icon name="map-pin" color="#E5E7EB" size={15} /><Txt color="#E5E7EB" size={13}>{profile.city} · {profile.distance} miles away</Txt></Row><Row style={{ flexWrap: `wrap`, gap: 7, marginTop: 4 }}>{profile.interests.slice(0, 3).map(interest => <View key={interest} style={{ borderWidth: 1, borderColor: `rgba(255,255,255,.18)`, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: `rgba(255,255,255,.12)` }}><Txt size={12} color="#FFFFFF">{interest}</Txt></View>)}</Row>
      </LinearGradient>
      <View style={{ position: `absolute`, top: 14, left: 15, right: 15, gap: 5, flexDirection: `row` }}>{profile.photos.map((_, index) => <View key={index} style={{ flex: 1, height: 3, borderRadius: 3, backgroundColor: index === photoIndex ? `#FFFFFF` : `rgba(255,255,255,.35)` }} />)}</View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Safety Options For ${profile.name}`} onPress={onSafety} style={{ position: `absolute`, top: 31, right: 16, padding: 8, borderRadius: 30, backgroundColor: `rgba(23,25,31,.45)` }}><Icon name="more-horizontal" color="#FFFFFF" size={20} /></Pressable>
      {profile.photos.length > 1 ? <View style={{ pointerEvents: `box-none`, position: `absolute`, top: `42%`, left: 13, right: 13, flexDirection: `row`, justifyContent: `space-between` }}><Pressable accessibilityRole="button" accessibilityLabel="Previous Photo" onPress={() => setPhotoIndex(value => (value - 1 + profile.photos.length) % profile.photos.length)} style={{ backgroundColor: `rgba(23,25,31,.5)`, padding: 9, borderRadius: 24 }}><Icon name="chevron-left" color="#FFFFFF" /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next Photo" onPress={() => setPhotoIndex(value => (value + 1) % profile.photos.length)} style={{ backgroundColor: `rgba(23,25,31,.5)`, padding: 9, borderRadius: 24 }}><Icon name="chevron-right" color="#FFFFFF" /></Pressable></View> : null}
    </Animated.View></GestureDetector>
    <Row style={{ justifyContent: `center`, gap: width < 360 ? 8 : width < 390 ? 12 : 20 }}><RoundAction label={`Rewind — ${ECONOMY.costs.rewind} XO(s) — ${rewindRemaining} of ${limits.rewind} left today`} disabled={busy || !canRewindSwipe(state)} onPress={() => { haptic(); act({ type: `rewind` }); }}><Icon name="rotate-ccw" size={24} color={colors.muted} /></RoundAction><RoundAction label={`Pass ${profile.name} — ${ECONOMY.costs.pass} XO(s)`} disabled={busy} onPress={() => choose(`pass`)}><ConnectedX size={33} /></RoundAction><RoundAction label={`Like ${profile.name} — ${ECONOMY.costs.like} XO(s)`} primary disabled={busy} onPress={() => choose(`like`)}><SymbolIcon name={`heart`} size={43} color={`#FFFFFF`} /></RoundAction><RoundAction label={`Super Like ${profile.name} — ${ECONOMY.costs.super} XO(s) — ${superRemaining} of ${limits.super} left today`} disabled={busy || !superRemaining} onPress={() => choose(`super`)}><Icon name="star" color={colors.accent} size={25} /></RoundAction></Row>
    <Row style={{ justifyContent: `space-between`, flexWrap: `wrap`, gap: 6 }}><Txt size={11} color={colors.muted}>Rewinds: {rewindRemaining}/{limits.rewind} left today</Txt><Txt size={11} color={colors.muted}>Super Likes: {superRemaining}/{limits.super} left today</Txt></Row>
    <Txt size={11} color={colors.muted} style={{ textAlign: `center` }}>Pass {ECONOMY.costs.pass} · Like {ECONOMY.costs.like} · Super Like {ECONOMY.costs.super} · Rewind {ECONOMY.costs.rewind} XO(s)</Txt>
  </View>;
};

export const DiscoverScreen = () => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { state, act } = useApp();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [safetyProfile, setSafetyProfile] = useState<Profile | null>(null);
  const profiles = discoveryProfiles(state);
  const rewindRemaining = remainingDailyAction(state, `rewind`);
  const profile = profiles[0];
  const matched = state.profiles.find(item => item.id === matchId && canViewProfile(state, item));
  const connections = visibleProfiles(state).filter(item => state.matches.includes(item.id)).slice(0, 3);
  const wide = width >= 1150;
  const like = () => {
    if (!profile) return;
    haptic();
    const result = act({ type: `swipe`, profileId: profile.id, kind: `like` });
    if (result.matchId) setMatchId(result.matchId);
  };
  return <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 25 }} style={{ flex: 1 }}>
    <View style={{ padding: width < 700 ? 20 : 32, maxWidth: 1160, width: `100%`, alignSelf: `center`, gap: 25 }}>
      <Row style={{ justifyContent: `space-between` }}><View style={{ gap: 4, flex: 1, minWidth: 0, marginRight: 12 }}><Txt size={width < 700 ? 29 : 34} weight="bold" style={{ letterSpacing: -1 }}>Discover</Txt><Row style={{ gap: 6 }}><Icon name="map-pin" size={14} color={colors.muted} /><Txt size={12} color={colors.muted} style={{ flexShrink: 1 }}>{state.user.city} · Within {state.preferences.distance} miles</Txt></Row></View><Button label="Filters" icon="sliders" variant="secondary" onPress={() => router.push(`/preferences`)} style={{ minHeight: 43, paddingHorizontal: 13 }} /></Row>
      {!profile ? <EmptyState icon="compass" title="You’re All Caught Up" description="That’s everyone in your current preferences. Widen your filters, rewind your last swipe, or spend time with your matches." action={<View style={{ gap: 10 }}><Button label="Adjust Preferences" onPress={() => router.push(`/preferences`)} />{state.swipes.length ? <View style={{ gap: 6 }}><Button label={`Rewind — ${ECONOMY.costs.rewind} XO(s)`} disabled={!canRewindSwipe(state)} variant="secondary" onPress={() => act({ type: `rewind` })} /><Txt size={11} style={{ textAlign: `center` }} color={colors.muted}>{rewindRemaining} of {PLAN_LIMITS[state.wallet.plan].rewind} rewinds left today</Txt></View> : null}<Button label="See Your Matches" variant="ghost" onPress={() => router.push(`/matches`)} /></View>} /> : <View style={{ flexDirection: wide ? `row` : `column`, alignItems: `flex-start`, gap: 28 }}>
        <View style={{ flex: wide ? 1.12 : undefined, width: wide ? undefined : `100%`, minWidth: 0 }}><SwipeCard key={profile.id} profile={profile} onMatch={setMatchId} onSafety={() => setSafetyProfile(profile)} /></View>
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : `100%`, gap: 20 }}><MessageProfileAction profile={profile} /><ProfileDetails profile={profile} onSafety={() => setSafetyProfile(profile)} onLike={wide ? like : undefined} />{wide ? <Panel style={{ padding: 21 }}><Row style={{ justifyContent: `space-between` }}><Txt weight="semibold">Your Connections</Txt><Pressable accessibilityRole="link" onPress={() => router.push(`/matches`)}><Txt size={12} color={colors.accentText}>View All</Txt></Pressable></Row><Row style={{ justifyContent: `flex-start`, gap: 25 }}>{connections.map(person => <Pressable key={person.id} accessibilityRole="link" accessibilityLabel={`Message ${person.name}`} onPress={() => router.push(`/messages/${person.id}` as never)} style={{ alignItems: `center`, gap: 8 }}><Avatar profile={person} size={57} /><Txt size={12}>{person.name}</Txt></Pressable>)}</Row><Button label="Find Your Type With MXO" icon="zap" variant="secondary" onPress={() => router.push(`/mxo`)} /></Panel> : null}</View>
      </View>}
      <Row style={{ justifyContent: `center`, gap: 6 }}><Icon name="shield" size={12} color={colors.muted} /><Txt size={11} color={colors.muted}>Your pace. Your people.</Txt></Row>
    </View>
    {safetyProfile ? <SafetyDialog profile={safetyProfile} close={() => setSafetyProfile(null)} /> : null}
    <Modal visible={!!matched} transparent animationType="fade" onRequestClose={() => setMatchId(null)}><View style={{ flex: 1, padding: 24, alignItems: `center`, justifyContent: `center`, backgroundColor: `rgba(9,11,17,.86)` }}>{matched ? <Panel style={{ alignItems: `center`, width: `100%`, maxWidth: 460, paddingVertical: 35, gap: 20 }}><ConnectedX size={54} /><Txt size={34} weight="bold" style={{ letterSpacing: -1 }}>It’s A Match.</Txt><Txt color={colors.muted} style={{ textAlign: `center` }}>You and {matched.name} liked each other.{`\n`}A good conversation starts with hello.</Txt><Row style={{ marginVertical: 9 }}><Avatar profile={state.user} size={105} /><Icon name="heart" color={colors.accent} size={29} /><Avatar profile={matched} size={105} /></Row><Button label="Say Hello" icon="message-circle" onPress={() => { setMatchId(null); router.push(`/messages/${matched.id}` as never); }} style={{ alignSelf: `stretch` }} /><Button label="Keep Discovering" variant="ghost" onPress={() => setMatchId(null)} /></Panel> : null}</View></Modal>
  </ScrollView>;
};

export const PersonScreen = ({ profileId }: { profileId: string }) => {
  const { state, act } = useApp();
  const { width } = useWindowDimensions();
  const [safety, setSafety] = useState(false);
  const profile = state.profiles.find(item => item.id === profileId && canViewProfile(state, item));
  if (!profile) return <View style={{ padding: 24 }}><EmptyState icon="eye-off" title="Profile Unavailable" description="This profile is no longer visible to you." action={<Button label="Back To Discover" onPress={() => router.replace(`/discover`)} />} /></View>;
  return <ScrollView contentContainerStyle={{ padding: 24, gap: 24, width: `100%`, maxWidth: 1000, alignSelf: `center` }}><Button label="Back To Discover" variant="ghost" icon="arrow-left" onPress={() => router.push(`/discover`)} style={{ alignSelf: `flex-start` }} /><View style={{ flexDirection: width > 1100 ? `row` : `column`, gap: 24 }}><View style={{ width: width > 1100 ? 360 : `100%`, height: 450, overflow: `hidden`, borderRadius: 22 }}><ProfilePhoto photo={profile.photos[0]} /></View><View style={{ flex: 1, gap: 15 }}><MessageProfileAction profile={profile} /><ProfileDetails profile={profile} onSafety={() => setSafety(true)} onLike={!state.swipes.some(item => item.profileId === profileId) && !state.matches.includes(profileId) ? () => { const result = act({ type: `swipe`, profileId, kind: `like` }); if (result.matchId) router.push(`/messages/${profileId}` as never); } : undefined} /></View></View>{safety ? <SafetyDialog profile={profile} close={() => setSafety(false)} /> : null}</ScrollView>;
};
