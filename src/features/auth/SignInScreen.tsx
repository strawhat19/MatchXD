import { router, Redirect } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { useState } from 'react';
import { useApp } from '../../state/AppProvider';
import { AppIcon } from '../../components/BrandMark';
import { useTheme } from '../../theme/ThemeProvider';
import { Txt, Row, Panel, Button } from '../../components/ui';

export const SignInScreen = () => {
  const { colors } = useTheme();
  const { state, act } = useApp();
  const [provider, setProvider] = useState(``);
  if (state.session) return <Redirect href={state.session.onboarded ? `/discover` : `/onboarding`} />;
  const begin = (role: `member` | `owner`) => {
    const result = act({ type: `start-session`, role });
    if (result.ok) router.replace(`/onboarding`);
  };
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: `center`, padding: 22 }}><View style={{ width: `100%`, maxWidth: 470, alignSelf: `center`, gap: 20 }}><Button label="Back" icon="arrow-left" variant="ghost" onPress={() => router.replace(`/`)} style={{ alignSelf: `flex-start` }} /><Panel style={{ padding: 30, gap: 22 }}><AppIcon size={60} /><View style={{ gap: 9 }}><Txt size={30} weight="bold">Your next hello.</Txt><Txt color={colors.muted}>Meet people who share your kind of life.</Txt></View><Button label="Continue" onPress={() => begin(`member`)} icon="heart" /><Button label="Manage MatchXD" variant="secondary" onPress={() => begin(`owner`)} icon="grid" /><View style={{ height: 1, backgroundColor: colors.border }} /><Txt weight="medium">Other Sign-In Options</Txt><Row style={{ flexWrap: `wrap`, gap: 9 }}>{[`Google`, `Apple`, `Facebook`, `Phone`].map(name => <Button key={name} label={name} variant="secondary" onPress={() => setProvider(name)} />)}</Row>{provider ? <Txt color={colors.accentText}>{provider} sign-in is not connected yet. Choose Continue to explore MatchXD.</Txt> : null}<Txt size={12} color={colors.muted}>For adults 18 and over.</Txt></Panel></View></ScrollView>;
};
