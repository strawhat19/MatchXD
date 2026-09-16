import { useRef, useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { Redirect, router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { View, Pressable, StyleSheet } from 'react-native';
import { SocialSignInOptions } from './SocialSignInOptions';
import { Txt, Row, Button, Divider } from '../../components/ui';

export const SignInScreen = () => {
  const busy = useRef(false);
  const { colors } = useTheme();
  const { state, act, dismissNotice } = useApp();
  const [error, setError] = useState(``);
  const [starting, setStarting] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const returning = !!state.onboardingComplete;
  if (state.session) return <Redirect href={state.session.onboarded ? `/discover` : `/onboarding`} />;
  const begin = (role: `member` | `owner`) => {
    if (busy.current) return;
    busy.current = true;
    setStarting(true);
    setError(``);
    dismissNotice();
    const result = act({ type: `start-session`, role });
    if (result.ok) router.replace(returning ? `/discover` : `/onboarding`);
    else { setError(result.message ?? `Unable To Continue — Try Again`); busy.current = false; setStarting(false); }
  };
  return <AuthLayout mode={`sign-in`}>
    <View style={styles.stack}>
      <View style={styles.heading}>
        <Txt size={11} weight={`semibold`} color={colors.accentText} style={styles.eyebrow}>LOVE THE COST OF LOVE.</Txt>
        <Txt size={38} weight={`bold`} accessibilityRole={`header`} style={styles.title}>{returning ? `Welcome back.` : `Your next hello.`}</Txt>
        <Txt size={15} color={colors.muted}>{returning ? `Thank you for helping shape MatchXD. Pick up your free preview where you left off.` : `An independent dating app, built by one developer. Join the free beta or express interest in founding access at $1/month later.`}</Txt>
      </View>
      <SocialSignInOptions />
      <Row style={{ gap: 14 }}><View style={[styles.line, { backgroundColor: colors.border }]} /><Txt size={11} weight={`medium`} color={colors.muted}>{returning ? `CONTINUE YOUR FREE PREVIEW` : `JOIN & TRY THE FREE PREVIEW`}</Txt><View style={[styles.line, { backgroundColor: colors.border }]} /></Row>
      <View style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.raised }]}>
        <Row><View style={[styles.previewIcon, { backgroundColor: colors.pale }]}><Icon name={returning ? `user-check` : `heart`} size={20} color={colors.accentText} /></View><View style={{ flex: 1, gap: 3 }}><Txt weight={`semibold`}>{returning ? `Continue As ${state.user.name}` : `Make Yourself At Home`}</Txt><Txt size={12} color={colors.muted}>{returning ? `Your saved profile is ready on this device.` : `Create a profile and explore MatchXD for free.`}</Txt></View></Row>
        <Button icon={`arrow-right`} disabled={starting} onPress={() => begin(`member`)} label={starting ? `Opening MatchXD…` : returning ? `Continue On This Device` : `Join MatchXD Free`} />
        <Txt size={12} color={colors.muted}>Your signup and activity stay on this device. Explore sample profiles for free; no payment or subscription starts, whichever option you choose.</Txt>
      </View>
      {error ? <Txt color={colors.danger} accessibilityRole={`alert`}>{error}</Txt> : null}
      <Row style={{ justifyContent: `center`, gap: 7 }}><Icon name={`shield`} size={14} color={colors.muted} /><Txt size={12} color={colors.muted} style={{ flexShrink: 1 }}>For Adults 18+ · You Choose What You Share</Txt></Row>
      <Divider />
      <View style={{ alignItems: `center`, gap: 10 }}>
        <Pressable disabled={starting} accessibilityRole={`button`} accessibilityLabel={`Preview Tools`} accessibilityState={{ expanded: showTools, disabled: starting }} onPress={() => setShowTools(value => !value)} style={styles.toolsButton}><Row style={{ gap: 6 }}><Txt size={12} color={colors.muted}>Preview Tools</Txt><Icon name={showTools ? `chevron-up` : `chevron-down`} size={14} color={colors.muted} /></Row></Pressable>
        {showTools ? <View style={{ gap: 8, width: `100%` }}><Button label={`Open Owner Preview`} icon={`grid`} variant={`secondary`} disabled={starting} onPress={() => begin(`owner`)} /><Txt size={12} color={colors.muted} style={{ textAlign: `center` }}>Explore the demo dashboard and sample profiles on this device.</Txt></View> : null}
      </View>
    </View>
  </AuthLayout>;
};

const styles = StyleSheet.create({
  stack: { gap: 25 },
  heading: { gap: 10 },
  line: { height: 1, flex: 1 },
  eyebrow: { letterSpacing: 1.3 },
  title: { lineHeight: 47, letterSpacing: -1.5 },
  preview: { gap: 17, padding: 20, borderWidth: 1, borderRadius: 20 },
  toolsButton: { minHeight: 44, justifyContent: `center`, paddingHorizontal: 14 },
  previewIcon: { width: 44, height: 44, borderRadius: 14, alignItems: `center`, justifyContent: `center` },
});
