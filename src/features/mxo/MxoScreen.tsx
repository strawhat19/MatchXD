import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { Profile } from '../../domain/types';
import { ECONOMY } from '../../config/economy';
import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components/ProfilePhoto';
import { canViewProfile } from '../../domain/matching';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Chip, Field, Page, Panel, Row, Txt } from '../../components/ui';

const suggestions = [`Coffee and hiking`, `Art and live music`, `Cooking and travel`];

export const MxoScreen = () => {
  const { state, act } = useApp();
  const { colors } = useTheme();
  const requestLock = useRef(false);
  const [draft, setDraft] = useState(``);
  const [notice, setNotice] = useState(``);
  const [sending, setSending] = useState(false);
  const submit = (text = draft) => {
    if (!text.trim() || requestLock.current) return;
    requestLock.current = true;
    setSending(true);
    const result = act({ type: `ask-mxo`, text: text.trim(), operationId: `mxo_${Date.now()}_${Math.random()}` });
    if (result.ok) setDraft(``);
    setNotice(result.ok ? `` : result.message ?? `Request Could Not Be Completed`);
    setTimeout(() => { requestLock.current = false; setSending(false); }, 350);
  };

  return <Page title="Meet Your Wingmate" subtitle="Tell MXO what you enjoy. Find a little common ground.">
    <Panel style={{ gap: 19, backgroundColor: colors.pale }}>
      <Row><View style={[styles.mark, { backgroundColor: colors.accent }]}><Icon name="star" size={25} color="#FFFFFF" /></View><View style={{ flex: 1 }}><Txt size={22} weight="bold">MXO</Txt><Txt color={colors.muted}>Your Connection Companion</Txt></View></Row>
      <Txt size={17}>More you. Less guesswork.</Txt>
      <Txt color={colors.muted}>Describe your interests in your own words. MXO finds profiles with shared interests and respects your saved preferences.</Txt>
      <Row style={{ flexWrap: `wrap` }}><Chip label={`${ECONOMY.costs.mxo} XO Per Request`} /></Row>
    </Panel>
    {!state.mxoMessages.length ? <View style={{ paddingVertical: 18, gap: 20 }}>
      <Txt size={19} weight="semibold">What Does Your Kind Of Day Look Like?</Txt>
      <Txt color={colors.muted}>A trail and a good coffee? An art show that turns into dinner? Start with something you love.</Txt>
      <Row style={{ flexWrap: `wrap` }}>{suggestions.map(suggestion => <Chip key={suggestion} label={suggestion} disabled={sending} onPress={() => setDraft(suggestion)} />)}</Row>
    </View> : <View style={{ gap: 22 }}>{state.mxoMessages.map(message => {
      const recommendations = (message.recommendations ?? []).map(id => state.profiles.find(profile => profile.id === id)).filter((profile): profile is Profile => profile !== undefined && canViewProfile(state, profile));
      return <View key={message.id} style={{ gap: 12, alignItems: message.role === `user` ? `flex-end` : `stretch` }}>
        {message.role === `assistant` ? <Row><Icon name="star" color={colors.accent} size={16} /><Txt size={12} weight="semibold" color={colors.accentText}>MXO</Txt></Row> : null}
        <View style={[styles.bubble, { borderColor: colors.border, backgroundColor: message.role === `user` ? colors.accent : colors.surface, maxWidth: message.role === `user` ? `90%` : `100%` }]}><Txt color={message.role === `user` ? colors.onAccent : colors.text}>{message.text}</Txt></View>
        {recommendations.length ? <View style={{ gap: 10 }}>{recommendations.map(profile => <Pressable key={profile.id} accessibilityRole="button" accessibilityLabel={`View ${profile.name}'s profile`} onPress={() => router.push(`/people/${profile.id}`)} style={[styles.recommendation, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Avatar profile={profile} size={60} /><View style={{ flex: 1, gap: 4 }}><Txt weight="semibold">{profile.name}</Txt><Txt size={12} color={colors.muted}>{profile.city} · {profile.distance} Miles Away</Txt><Txt size={12} color={colors.accentText}>{profile.interests.slice(0, 3).join(` · `)}</Txt></View><Icon name="arrow-up-right" size={19} color={colors.accent} />
        </Pressable>)}</View> : message.recommendations?.length ? <Txt size={12} color={colors.muted}>These recommendations are no longer visible. Try a new request.</Txt> : null}
      </View>;
    })}</View>}
    {notice ? <Panel><Txt color={colors.danger}>{notice}</Txt>{state.wallet.daily + state.wallet.purchased < ECONOMY.costs.mxo ? <Button label="Visit Your Wallet" variant="ghost" onPress={() => router.push(`/wallet`)} /> : null}</Panel> : null}
    <Panel style={{ gap: 14 }}>
      <Field accessibilityLabel="Describe what you enjoy" placeholder="I love coffee, hikes, and a good sense of humor…" multiline value={draft} onChangeText={setDraft} maxLength={600} style={{ minHeight: 90 }} />
      <Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><Txt size={12} color={colors.muted}>Uses your interests, not inferred personal traits</Txt><Button label="Find Common Ground" icon="arrow-up-right" disabled={!draft.trim() || sending} onPress={() => submit()} /></Row>
    </Panel>
    <Txt size={12} color={colors.muted}>Fine-tune age, distance, and optional criteria in Preferences.</Txt>
    <Button label="Your Preferences" icon="sliders" variant="ghost" onPress={() => router.push(`/preferences`)} />
  </Page>;
};

const styles = StyleSheet.create({
  mark: { width: 52, height: 52, borderRadius: 18, alignItems: `center`, justifyContent: `center` },
  bubble: { padding: 18, borderWidth: 1, borderRadius: 20 },
  recommendation: { gap: 14, padding: 16, borderWidth: 1, borderRadius: 18, flexDirection: `row`, alignItems: `center` },
});
