import { useState } from 'react';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { canViewProfile } from '../../domain/matching';
import { Avatar } from '../../components/ProfilePhoto';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, EmptyState, Field, Page, Panel, Row, Txt } from '../../components/ui';

export const MatchesScreen = () => {
  const { state } = useApp();
  const { colors } = useTheme();
  const [search, setSearch] = useState(``);
  const visible = state.profiles.filter(profile => canViewProfile(state, profile));
  const latestByProfile = new Map(state.messages.map(message => [message.profileId, message]));
  const matches = visible.filter(profile => state.matches.includes(profile.id));
  const threads = visible.filter(profile => state.matches.includes(profile.id) || latestByProfile.has(profile.id));
  const filtered = threads.filter(profile => profile.name.toLowerCase().includes(search.trim().toLowerCase())).sort((left, right) => {
    const lastLeft = latestByProfile.get(left.id)?.at ?? ``;
    const lastRight = latestByProfile.get(right.id)?.at ?? ``;
    return lastRight.localeCompare(lastLeft);
  });
  const open = (profileId: string) => router.push(`/messages/${profileId}`);

  return <Page title="Good Things Start With Hello" subtitle="A little connection. A lot of possibility.">
    {matches.length ? <View style={{ gap: 16 }}>
      <Row><Txt size={18} weight="semibold">Made For A Hello</Txt><View style={[styles.count, { backgroundColor: colors.pale }]}><Txt weight="semibold" color={colors.accentText}>{matches.length}</Txt></View></Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.connections}>
        {matches.map(profile => <Pressable key={profile.id} accessibilityRole="button" accessibilityLabel={`Message ${profile.name}`} onPress={() => open(profile.id)} style={styles.connection}>
          <View style={[styles.avatarRing, { borderColor: colors.accent }]}><Avatar profile={profile} size={72} /></View>
          <Txt weight="medium">{profile.name}</Txt>
        </Pressable>)}
      </ScrollView>
    </View> : null}
    <Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><Txt size={20} weight="semibold">Messages</Txt><Txt size={12} color={colors.muted}>Free chat after a mutual match</Txt></Row>
    <Field accessibilityLabel="Search conversations" placeholder="Search your conversations" value={search} onChangeText={setSearch} />
    {filtered.length ? <Panel style={{ padding: 0, overflow: `hidden` }}>
      {filtered.map((profile, index) => {
        const latest = latestByProfile.get(profile.id);
        const matched = state.matches.includes(profile.id);
        return <Pressable key={profile.id} accessibilityRole="button" accessibilityLabel={`Open conversation with ${profile.name}${matched ? `, matched, free chat` : `, waiting for a match`}`} onPress={() => open(profile.id)} style={[styles.messageRow, { borderBottomColor: colors.border, borderBottomWidth: index < filtered.length - 1 ? 1 : 0 }]}>
          <Avatar profile={profile} size={52} />
          <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Row style={{ justifyContent: `space-between`, flexWrap: `wrap`, gap: 3 }}><Txt weight="semibold" size={16}>{profile.name}</Txt><Txt size={11} color={colors.muted}>{latest ? new Date(latest.at).toLocaleDateString(undefined, { month: `short`, day: `numeric` }) : `New Connection`}</Txt></Row><Txt color={colors.muted} numberOfLines={2}>{latest ? `${latest.sender === `self` ? `You: ` : ``}${latest.text.slice(0, 100)}` : `You matched! Say something that feels like you.`}</Txt><Txt size={11} weight="medium" color={matched ? colors.success : colors.muted}>{matched ? `Matched · Free Chat` : `First Message Sent · Waiting For A Match`}</Txt></View>
          <Icon name="chevron-right" size={18} color={colors.muted} />
        </Pressable>;
      })}
    </Panel> : <EmptyState icon="message-circle" title={search ? `No Conversations Found` : `Your Next Hello Is Out There`} description={search ? `Try another name to find your conversation.` : `Meet someone in Discover. Send a first message or like their profile. Your messages and mutual matches appear here.`} action={!search ? <Button label="Explore Discover" onPress={() => router.push(`/discover`)} icon="compass" /> : undefined} />}
  </Page>;
};

const styles = StyleSheet.create({
  count: { borderRadius: 10, paddingVertical: 3, paddingHorizontal: 9 },
  connection: { gap: 7, alignItems: `center`, minWidth: 84 },
  connections: { gap: 22, paddingVertical: 3, paddingRight: 16 },
  avatarRing: { padding: 4, borderWidth: 2, borderRadius: 45 },
  messageRow: { gap: 10, padding: 16, flexDirection: `row`, alignItems: `center` },
});
