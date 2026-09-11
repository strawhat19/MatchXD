import { router } from 'expo-router';
import { ECONOMY } from '../../config/economy';
import { PLAN_LIMITS } from '../../config/plans';
import { useApp } from '../../state/AppProvider';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { canViewProfile } from '../../domain/matching';
import { Avatar } from '../../components/ProfilePhoto';
import { Pressable, StyleSheet, View } from 'react-native';
import { introductionAvailability } from '../../domain/quotas';
import { Button, Chip, EmptyState, Field, Page, Panel, Row, Txt } from '../../components/ui';

export const ConversationScreen = ({ profileId }: { profileId: string }) => <ConversationThread key={profileId} profileId={profileId} />;

const ConversationThread = ({ profileId }: { profileId: string }) => {
  const { state, act } = useApp();
  const { colors } = useTheme();
  const sendLock = useRef(false);
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState(``);
  const [notice, setNotice] = useState(``);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState(``);
  const [sending, setSending] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [confirm, setConfirm] = useState<`block` | `unmatch` | null>(null);
  const profile = state.profiles.find(item => item.id === profileId);
  const messages = state.messages.filter(item => item.profileId === profileId);
  const matched = state.matches.includes(profileId);
  const introduced = state.introductions?.some(item => item.profileId === profileId);
  const introduction = introductionAvailability(state, profileId);
  const messageCost = matched ? 0 : ECONOMY.costs.firstMessage;
  const waiting = !matched && introduced && messages.length > 0;
  const contactEnded = !matched && (introduced ? !messages.length : state.contactHistory?.includes(profileId));
  const canSend = matched || introduction.available;
  const firstMessageLimit = PLAN_LIMITS[state.wallet.plan].firstMessage;
  useEffect(() => () => { if (sendTimer.current) clearTimeout(sendTimer.current); }, []);

  if (!profile || !canViewProfile(state, profile)) return <Page title="Conversation Unavailable"><EmptyState icon="message-circle" title="This Connection Is No Longer Available" description="This profile is no longer visible to you. Explore your other connections to keep the conversation going." action={<Button label="Back To Connections" onPress={() => router.replace(`/matches`)} />} /></Page>;
  const send = () => {
    if (sendLock.current || !draft.trim() || !canSend) return;
    sendLock.current = true;
    setSending(true);
    const result = act({ type: `send-message`, profileId, text: draft.trim(), operationId: `message_${Date.now()}_${Math.random()}` });
    if (result.ok) setDraft(``);
    setFailed(!result.ok);
    setNotice(result.ok ? `` : result.message ?? `Message Could Not Be Sent`);
    sendTimer.current = setTimeout(() => { sendLock.current = false; setSending(false); }, 350);
  };
  const report = () => {
    const result = act({ type: `report`, profileId, reason: reason.trim() });
    setFailed(!result.ok);
    setNotice(result.message ?? (result.ok ? `Report Saved` : `Report Could Not Be Saved`));
    if (result.ok) { setReason(``); setSafetyOpen(false); }
  };
  const finishConnection = () => {
    if (!confirm) return;
    const result = act({ type: confirm, profileId });
    if (result.ok) router.replace(`/matches`);
    else { setFailed(true); setNotice(result.message ?? `Connection Could Not Be Updated`); }
    setConfirm(null);
  };

  return <Page title={`You & ${profile.name}`} subtitle={matched ? `You matched. Every message from here is free.` : `One hello can start something good.`} action={<Button label="Connections" variant="ghost" icon="arrow-left" onPress={() => router.push(`/matches`)} />}>
    <Panel>
      <Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`View ${profile.name}'s profile`} onPress={() => router.push(`/people/${profile.id}`)} style={styles.profile}>
          <Avatar profile={profile} size={54} /><View style={{ gap: 3, flex: 1 }}><Txt size={18} weight="semibold">{profile.name}</Txt><Txt size={12} color={colors.muted}>{profile.city}</Txt></View>
        </Pressable>
        <Button label="Safety" variant="ghost" icon="shield" onPress={() => setSafetyOpen(!safetyOpen)} />
      </Row>
    </Panel>
    {safetyOpen ? <Panel style={{ gap: 16 }}>
      <Txt size={18} weight="semibold">Your Comfort Comes First</Txt>
      <Txt color={colors.muted}>Reports are saved on this device for review in Manage MatchXD. Blocking hides this profile across the app. These actions are free.</Txt>
      <Row style={{ flexWrap: `wrap` }}>{matched ? <Button label="Unmatch" variant="secondary" onPress={() => setConfirm(`unmatch`)} /> : null}<Button label="Block Profile" variant="danger" onPress={() => setConfirm(`block`)} /></Row>
      <Field label="Report A Concern" placeholder="Tell us what happened" multiline value={reason} onChangeText={setReason} maxLength={1000} />
      <Row style={{ flexWrap: `wrap` }}>{[`Inappropriate Content`, `Spam Or Scam`, `Harassment`].map(label => <Chip key={label} label={label} selected={reason === label} onPress={() => setReason(label)} />)}</Row>
      <Button label="Save Report" variant="secondary" disabled={!reason.trim()} onPress={report} icon="flag" />
    </Panel> : null}
    {confirm ? <Panel style={{ gap: 14, borderColor: colors.danger }}><Txt weight="semibold">{confirm === `block` ? `Block This Profile?` : `End This Connection?`}</Txt><Txt color={colors.muted}>{confirm === `block` ? `Your connection and conversation will be removed. You can unblock in Settings.` : `This removes your mutual match and its conversation.`}</Txt><Row style={{ flexWrap: `wrap` }}><Button label={confirm === `block` ? `Confirm Block` : `Confirm Unmatch`} variant="danger" onPress={finishConnection} /><Button label="Keep Connection" variant="ghost" onPress={() => setConfirm(null)} /></Row></Panel> : null}
    <View style={styles.conversation}>
      {messages.length ? messages.map(message => <View key={message.id} style={{ alignItems: message.sender === `self` ? `flex-end` : `flex-start`, gap: 5 }}>
        <View style={[styles.bubble, { backgroundColor: message.sender === `self` ? colors.accent : colors.surface, borderColor: message.sender === `self` ? colors.accent : colors.border, borderBottomRightRadius: message.sender === `self` ? 5 : 20, borderBottomLeftRadius: message.sender === `profile` ? 5 : 20 }]}><Txt color={message.sender === `self` ? colors.onAccent : colors.text}>{message.text}</Txt></View>
        <Txt size={10} color={colors.muted}>{new Date(message.at).toLocaleTimeString(undefined, { hour: `numeric`, minute: `2-digit` })}</Txt>
      </View>) : <EmptyState icon={matched ? `heart` : `message-circle`} title={matched ? `It's A Connection` : contactEnded ? `A New Match Is Needed` : waiting ? `Waiting For A Match` : `Make The First Move`} description={matched ? `You and ${profile.name} liked each other. Share a little of your day to get things started.` : contactEnded ? `This conversation has ended. You’ll need a new mutual match before messaging again.` : waiting ? `You’ve already sent your first message to ${profile.name}. You can chat again after a mutual match.` : `Send ${profile.name} one first message for ${messageCost} XO. Keep chatting for free once you both like each other.`} />}
    </View>
    {notice ? <Panel><Txt color={failed ? colors.danger : colors.success}>{notice}</Txt></Panel> : null}
    {waiting || contactEnded ? <Panel style={{ gap: 12 }}><Chip label={contactEnded ? `Conversation Ended` : `Waiting For A Match`} /><Txt weight="semibold">{contactEnded ? `A New Match Is Needed` : `Your First Message Is Sent`}</Txt><Txt color={colors.muted}>{contactEnded ? `This conversation has ended. A new mutual match is needed to message again.` : `You can send another message after you both like each other. Matched conversations are always free.`}</Txt><Button label="View Profile" variant="secondary" onPress={() => router.push(`/people/${profile.id}`)} /></Panel> : <Panel style={{ gap: 12 }}>
      <Field accessibilityLabel={`Message ${profile.name}`} placeholder={`Say hello to ${profile.name}…`} value={draft} onChangeText={setDraft} multiline maxLength={2000} style={{ minHeight: 70 }} />
      <Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><View style={{ gap: 3, flexShrink: 1 }}><Txt size={12} color={colors.muted}>{matched ? `Matched Chat · Free` : `First Message · ${messageCost} XO`}</Txt>{!matched ? <Txt size={11} color={colors.muted}>{introduction.remaining} of {firstMessageLimit} first messages left today</Txt> : null}</View><Button label={matched ? `Send` : `Send First Message`} icon="send" disabled={!draft.trim() || sending || !canSend} onPress={send} /></Row>
      {!matched && !introduction.available && introduction.reason ? <Txt size={12} color={colors.muted}>{introduction.reason}</Txt> : null}
      {!matched && state.wallet.daily + state.wallet.purchased < messageCost ? <Button label="Visit Your Wallet" variant="ghost" onPress={() => router.push(`/wallet`)} /> : null}
    </Panel>}
  </Page>;
};

const styles = StyleSheet.create({
  profile: { gap: 12, flex: 1, minWidth: 160, alignItems: `center`, flexDirection: `row` },
  conversation: { gap: 18, minHeight: 210, paddingVertical: 10 },
  bubble: { padding: 16, maxWidth: `85%`, borderWidth: 1, borderRadius: 20 },
});
