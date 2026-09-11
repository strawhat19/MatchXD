import { AuthLayout } from './AuthLayout';
import { INTERESTS } from '../../config/app';
import { Icon } from '../../components/Icon';
import { ageOf } from '../../domain/matching';
import { Redirect, router } from 'expo-router';
import { useApp } from '../../state/AppProvider';
import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { SocialSignInOptions } from './SocialSignInOptions';
import { OnboardingPhotoPicker } from './OnboardingPhotoPicker';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { Txt, Row, Chip, Field, Button, SwitchRow } from '../../components/ui';
import { View, Platform, Keyboard, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';

const steps = [`The Basics`, `Your Look`, `Your Vibe`];
const stepReveal = FadeIn.duration(220).reduceMotion(ReduceMotion.System);
type FieldErrors = { name?: string; dob?: string; city?: string; photo?: string; agreed?: string };
const formatBirthDate = (value: string) => {
  const digits = value.replace(/\D/g, ``).slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join(`-`);
};

export const OnboardingScreen = () => {
  const saving = useRef(false);
  const heading = useRef<View>(null);
  const { colors } = useTheme();
  const { state, act, dismissNotice } = useApp();
  const [step, setStep] = useState(0);
  const previousStep = useRef(step);
  const [name, setName] = useState(``);
  const [dob, setDob] = useState(``);
  const [city, setCity] = useState(``);
  const [bio, setBio] = useState(``);
  const [photo, setPhoto] = useState(``);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(``);
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const frame = requestAnimationFrame(() => {
      if (Platform.OS === `web`) heading.current?.focus();
      else AccessibilityInfo.announceForAccessibility(`Step ${step + 1} Of 3: ${steps[step]}`);
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);
  if (!state.session) return <Redirect href={`/sign-in`} />;
  if (state.session.onboarded) return <Redirect href={`/discover`} />;
  const blocked = busy || photoBusy;
  const clearError = (field: keyof FieldErrors) => { setErrors(current => ({ ...current, [field]: undefined })); setError(``); };
  const changeStep = (index: number) => {
    Keyboard.dismiss();
    setError(``);
    setErrors({});
    setStep(index);
  };
  const basicsErrors = (): FieldErrors => {
    const age = ageOf(dob);
    return {
      ...(!city.trim() ? { city: `Enter Your City` } : {}),
      ...(!name.trim() ? { name: `Enter Your First Name` } : {}),
      ...(!Number.isFinite(age) || age < 18 || age > 120 ? { dob: `Enter A Valid Birth Date — You Must Be 18 Or Older` } : {}),
    };
  };
  const advance = () => {
    if (blocked || saving.current) return;
    const nextErrors = step === 0 ? basicsErrors() : !photo ? { photo: `Add A Photo Or Choose An Avatar To Continue` } : {};
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    changeStep(step + 1);
  };
  const finish = () => {
    if (blocked || saving.current) return;
    const invalidBasics = basicsErrors();
    if (Object.keys(invalidBasics).length) { setStep(0); setErrors(invalidBasics); return; }
    if (!photo) { setStep(1); setErrors({ photo: `Add A Photo Or Choose An Avatar To Continue` }); return; }
    if (!agreed) { setErrors({ agreed: `Confirm You Are 18 Or Older To Continue` }); return; }
    saving.current = true;
    setBusy(true);
    setError(``);
    Keyboard.dismiss();
    const result = act({ type: `save-user`, profile: { dob, interests, photos: [photo], name: name.trim(), city: city.trim(), bio: bio.trim() }, complete: true });
    if (result.ok) router.replace(`/discover`);
    else { setError(result.message ?? `Profile Could Not Be Saved — Try Again`); saving.current = false; setBusy(false); }
  };
  const leave = () => {
    if (blocked) return;
    dismissNotice();
    act({ type: `cancel-onboarding` });
    router.replace(`/sign-in`);
  };
  return <AuthLayout mode={`sign-up`} contentKey={step}>
    <View style={styles.stack}>
      <Row style={{ justifyContent: `space-between`, flexWrap: `wrap`, gap: 5 }}><Txt size={11} color={colors.accentText} weight={`semibold`} style={styles.eyebrow}>MAKE YOURSELF AT HOME</Txt><Pressable disabled={blocked} accessibilityRole={`button`} accessibilityLabel={`Back To Sign In`} accessibilityState={{ disabled: blocked }} onPress={leave} style={styles.textButton}><Txt size={12} weight={`medium`} color={colors.muted}>Back To Sign In</Txt></Pressable></Row>
      <Row style={{ gap: 10 }}>{steps.map((label, index) => <Pressable key={label} disabled={blocked || index > step} accessibilityRole={`button`} accessibilityLabel={`Step ${index + 1}: ${label}`} accessibilityState={{ selected: step === index, disabled: blocked || index > step }} onPress={() => changeStep(index)} style={{ flex: 1, gap: 9, paddingVertical: 7 }}><View style={[styles.progress, { backgroundColor: index <= step ? colors.accent : colors.border }]} /><Row style={{ gap: 7 }}><View style={[styles.stepNumber, { backgroundColor: index <= step ? colors.pale : colors.raised }]}>{index < step ? <Icon name={`check`} size={12} color={colors.accentText} /> : <Txt size={10} weight={`semibold`} color={index === step ? colors.accentText : colors.muted}>{index + 1}</Txt>}</View><Txt size={11} color={index === step ? colors.text : colors.muted} weight={index === step ? `semibold` : `regular`} style={{ flexShrink: 1 }}>{label}</Txt></Row></Pressable>)}</Row>
      <Animated.View key={step} entering={stepReveal} style={styles.stack}>
        <View ref={heading} tabIndex={-1} style={{ gap: 8 }}><Txt size={32} weight={`bold`} accessibilityRole={`header`} style={styles.title}>{[`Start with you.`, `Make it feel like you.`, `Give them a little more you.`][step]}</Txt><Txt color={colors.muted}>{[`A few basics. The rest is a conversation.`, `A fresh photo or an avatar. Your first impression, your choice.`, `Your favorite things make the best conversation starters.`][step]}</Txt></View>
        {step === 0 ? <View style={styles.fields}>
          <View style={{ gap: 5 }}><Field label={`First Name`} placeholder={`What should we call you?`} value={name} autoComplete={`given-name`} textContentType={`givenName`} autoCapitalize={`words`} maxLength={40} returnKeyType={`next`} onChangeText={value => { setName(value); clearError(`name`); }} style={errors.name ? { borderColor: colors.danger } : undefined} />{errors.name ? <Txt size={12} color={colors.danger} accessibilityRole={`alert`}>{errors.name}</Txt> : null}</View>
          <View style={{ gap: 5 }}><Field label={`Date Of Birth`} placeholder={`YYYY-MM-DD`} value={dob} autoComplete={`birthdate-full`} autoCorrect={false} maxLength={10} keyboardType={`number-pad`} onChangeText={value => { setDob(formatBirthDate(value)); clearError(`dob`); }} style={errors.dob ? { borderColor: colors.danger } : undefined} />{errors.dob ? <Txt size={12} color={colors.danger} accessibilityRole={`alert`}>{errors.dob}</Txt> : <Txt size={12} color={colors.muted}>Your birth date stays private. Only your age appears on your profile.</Txt>}</View>
          <View style={{ gap: 5 }}><Field label={`City`} placeholder={`Where are you based?`} value={city} autoComplete={`postal-address-locality`} textContentType={`addressCity`} autoCapitalize={`words`} maxLength={80} returnKeyType={`next`} onSubmitEditing={advance} onChangeText={value => { setCity(value); clearError(`city`); }} style={errors.city ? { borderColor: colors.danger } : undefined} />{errors.city ? <Txt size={12} color={colors.danger} accessibilityRole={`alert`}>{errors.city}</Txt> : null}</View>
        </View> : step === 1 ? <View style={{ gap: 10 }}><OnboardingPhotoPicker photo={photo} onBusyChange={setPhotoBusy} onChange={value => { setPhoto(value); clearError(`photo`); }} />{errors.photo ? <Txt size={12} color={colors.danger} accessibilityRole={`alert`}>{errors.photo}</Txt> : null}</View> : <View style={styles.fields}>
          <View style={{ gap: 6 }}><Field multiline numberOfLines={3} maxLength={600} label={`A Little About You (Optional)`} placeholder={`My ideal Sunday starts with…`} value={bio} onChangeText={setBio} style={{ minHeight: 106 }} /><Txt size={11} color={colors.muted} style={{ textAlign: `right` }}>{bio.length} / 600</Txt></View>
          <View style={{ gap: 12 }}><Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><Txt weight={`medium`}>Your Interests (Optional)</Txt><Txt size={12} color={colors.muted}>{interests.length} / 12</Txt></Row><Row style={{ flexWrap: `wrap`, gap: 8 }}>{INTERESTS.map(interest => <Chip key={interest} label={interest} selected={interests.includes(interest)} disabled={!interests.includes(interest) && interests.length >= 12} onPress={() => setInterests(current => current.includes(interest) ? current.filter(value => value !== interest) : current.length < 12 ? [...current, interest] : current)} />)}</Row><Txt size={12} color={colors.muted}>Choose up to 12 things you love. You can change them later.</Txt></View>
          <View style={[styles.confirmation, { backgroundColor: colors.raised, borderColor: errors.agreed ? colors.danger : colors.border }]}><SwitchRow label={`I Am 18 Or Older`} description={`MatchXD is for adults. Please confirm your age to continue.`} value={agreed} onValueChange={value => { setAgreed(value); clearError(`agreed`); }} />{errors.agreed ? <Txt size={12} color={colors.danger} accessibilityRole={`alert`}>{errors.agreed}</Txt> : null}</View>
        </View>}
      </Animated.View>
      {error ? <Txt color={colors.danger} accessibilityRole={`alert`}>{error}</Txt> : null}
      <View style={{ gap: 13 }}><Row style={{ gap: 10 }}>{step > 0 ? <Button label={`Back`} icon={`arrow-left`} variant={`secondary`} onPress={() => changeStep(step - 1)} disabled={blocked} /> : null}<Button label={busy ? `Saving Your Profile…` : step === 2 ? `Meet Your People` : `Continue`} icon={`arrow-right`} disabled={blocked} onPress={step === 2 ? finish : advance} style={{ flex: 1 }} /></Row><Txt size={12} color={colors.muted} style={{ textAlign: `center` }}>{step === 2 ? `Your preview profile stays on this device. Edit it any time.` : `Step ${step + 1} Of 3 · A Little About You Goes A Long Way`}</Txt></View>
      {step === 0 ? <View style={{ gap: 12, borderTopWidth: 1, paddingTop: 22, borderColor: colors.border }}><SocialSignInOptions compact /></View> : null}
    </View>
  </AuthLayout>;
};

const styles = StyleSheet.create({
  stack: { gap: 24 },
  fields: { gap: 20 },
  eyebrow: { letterSpacing: 1.3 },
  progress: { height: 3, borderRadius: 3 },
  title: { lineHeight: 41, letterSpacing: -1.2 },
  textButton: { minHeight: 44, justifyContent: `center` },
  confirmation: { gap: 9, padding: 16, borderWidth: 1, borderRadius: 14 },
  stepNumber: { width: 22, height: 22, borderRadius: 11, alignItems: `center`, justifyContent: `center` },
});
