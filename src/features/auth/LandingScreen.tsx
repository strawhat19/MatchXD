import { PLANS } from '../../config/plans';
import { Icon } from '../../components/Icon';
import { Link, router, Redirect } from 'expo-router';
import { useApp } from '../../state/AppProvider';
import { WordCircle } from '../landing/WordCircle';
import { SparkButton } from '../landing/SparkButton';
import { orbitPhones } from '../landing/phoneOrbit';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { PhonePreview } from '../landing/PhonePreview';
import { LandingHeader } from '../landing/LandingHeader';
import { Txt, Row, Button, Panel } from '../../components/ui';
import { AppIcon, BrandMark } from '../../components/BrandMark';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PricingComparison } from '../landing/PricingComparison';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal, View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown, Extrapolation, ReduceMotion, cancelAnimation, interpolate, runOnJS, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

const ink = `#17191F`;
const initialOrbitScale = .74;
const fullCircle = Math.PI * 2;
const orbitRadiusRatio = 410 / 280;
const orbitOuterRatio = Math.hypot(.5, orbitRadiusRatio + 1.04);
const stories = [
  { icon: `heart`, title: `A Spark That Feels Like You`, description: `A good photo is the beginning. Find common ground in the little things you love, then let a conversation take it from there.` },
  { icon: `message-circle`, title: `Less Guesswork. More Hello.`, description: `Discover, your MXO wingmate, and your conversations live together. A little help finding your people, with room to be yourself.` },
  { icon: `shield`, title: `Your Pace. Your Choice.`, description: `Choose what you share. Keep public links opt-in, set your preferences, and block or report a profile whenever you need to.` },
] as const;

type OrbitPhoneProps = {
  index: number;
  width: number;
  radius: number;
  revealEnd: number;
  revealScale: number;
  revealRadius: number;
  collapseStart: number;
  collapseEnd: number;
  reducedMotion: boolean;
  phase: SharedValue<number>;
  scroll: SharedValue<number>;
};

const EntryReveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => <View style={{ overflow: `hidden` }}><Animated.View entering={FadeInDown.duration(1000).delay(delay).reduceMotion(ReduceMotion.System)}>{children}</Animated.View></View>;

const OrbitPhone = ({ index, width, phase, scroll, radius, revealEnd, revealScale, revealRadius, collapseStart, collapseEnd, reducedMotion }: OrbitPhoneProps) => {
  const transform = useAnimatedStyle(() => {
    const gathered = reducedMotion ? Number(scroll.get() > (collapseStart + collapseEnd) / 2) : interpolate(scroll.get(), [collapseStart, collapseEnd], [0, 1], Extrapolation.CLAMP);
    const revealed = reducedMotion ? 1 : interpolate(scroll.get(), [0, revealEnd], [0, 1], Extrapolation.CLAMP);
    const angle = (reducedMotion ? 0 : phase.get()) + index * fullCircle / orbitPhones.length;
    const currentRadius = radius + (revealRadius - radius) * revealed;
    const currentScale = initialOrbitScale + (revealScale - initialOrbitScale) * revealed;
    const spread = 1 - gathered;
    return {
      zIndex: index === 0 ? 20 : orbitPhones.length - index,
      opacity: index === 0 ? 1 : interpolate(gathered, [.25, .95], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: Math.sin(angle) * currentRadius * spread },
        { translateY: -Math.cos(angle) * currentRadius * spread },
        { rotateZ: `${Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI * spread}deg` },
        { scale: currentScale * spread + gathered },
      ],
    };
  });
  const phone = orbitPhones[index];
  return <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.phone, { width, left: `50%`, marginLeft: -width / 2, marginTop: -width * 1.04 }, transform]}>
    <PhonePreview width={width} model={phone.model} screen={phone.screen} person={phone.person} />
  </Animated.View>;
};

export const LandingScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { state, ready } = useApp();
  const { width, height } = useWindowDimensions();
  const mobile = width < 700;
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [orbitVisible, setOrbitVisible] = useState(true);
  const [circleVisible, setCircleVisible] = useState(false);
  const [centerIconVisible, setCenterIconVisible] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [headingHeight, setHeadingHeight] = useState(350);
  const phase = useSharedValue(0);
  const iconPhase = useSharedValue(0);
  const scroll = useSharedValue(0);
  const availableHeight = height - (width < 700 ? 80 : 68) - insets.top - insets.bottom;
  const phoneWidth = Math.min(340, width - 40, Math.max(280, width * .72), Math.max(112, (availableHeight - 80) / 2.08));
  const phoneHeight = phoneWidth * 2.08;
  const iconSize = phoneWidth * 120 / 280;
  const ringDiameter = phoneWidth * orbitOuterRatio * 2;
  const revealScale = Math.min(initialOrbitScale, availableHeight * .94 / ringDiameter, (width < 700 ? width * 1.75 : width - 32) / ringDiameter);
  const orbitRadius = phoneWidth * orbitRadiusRatio * initialOrbitScale;
  const revealRadius = phoneWidth * orbitRadiusRatio * revealScale;
  const revealEnd = Math.min(220, height * .23);
  const travel = Math.min(380, height * .44);
  const collapseStart = revealEnd + 70;
  const collapseEnd = collapseStart + travel;
  const iconFadeEnd = collapseStart + (collapseEnd - collapseStart) * .55;
  const introFadeEnd = revealEnd * .55;
  const reducedIntroEnd = (collapseStart + collapseEnd) / 2;
  const stageCenter = headingHeight + phoneWidth * orbitOuterRatio * initialOrbitScale + 72;
  const finalCenter = availableHeight * .48;
  const followDistance = collapseEnd - stageCenter + finalCenter;
  const revealFollowDistance = revealEnd - stageCenter + availableHeight * .54;
  const reducedFollowDistance = headingHeight + phoneWidth * orbitOuterRatio * revealScale + 72 - stageCenter;
  const copyTop = stageCenter + followDistance + phoneHeight / 2 + 36;
  const heroHeight = copyTop + 170;
  const circleTop = heroHeight + styles.storySection.paddingTop;
  const titleSize = mobile ? Math.min(70, Math.max(44, width * .14)) : Math.min(104, Math.max(36, (width - 32) / 6.8));
  const titleStyle = { lineHeight: titleSize * 1.12, letterSpacing: -titleSize * .055 };

  useEffect(() => {
    cancelAnimation(phase);
    if (orbitVisible && !privacyOpen && !reducedMotion) phase.set(withRepeat(withTiming(phase.get() + fullCircle, { duration: 36000, easing: Easing.linear }), -1));
    return () => cancelAnimation(phase);
  }, [orbitVisible, phase, privacyOpen, reducedMotion]);
  useEffect(() => {
    cancelAnimation(iconPhase);
    if (centerIconVisible && !privacyOpen && !reducedMotion) iconPhase.set(withRepeat(withTiming(iconPhase.get() + 360, { duration: 24000, easing: Easing.linear }), -1));
    return () => cancelAnimation(iconPhase);
  }, [centerIconVisible, iconPhase, privacyOpen, reducedMotion]);
  useAnimatedReaction(() => scroll.get() < collapseStart, (visible, previous) => {
    if (visible !== previous) runOnJS(setOrbitVisible)(visible);
  }, [collapseStart]);
  useAnimatedReaction(() => reducedMotion ? scroll.get() <= reducedIntroEnd : scroll.get() < introFadeEnd, (visible, previous) => {
    if (visible !== previous) runOnJS(setIntroVisible)(visible);
  }, [reducedMotion, reducedIntroEnd, introFadeEnd]);
  useAnimatedReaction(() => scroll.get() + availableHeight > circleTop && scroll.get() < circleTop + 144, (visible, previous) => {
    if (visible !== previous) runOnJS(setCircleVisible)(visible);
  }, [circleTop, availableHeight]);
  useAnimatedReaction(() => {
    const offset = scroll.get();
    const revealed = reducedMotion ? 1 : interpolate(offset, [0, revealEnd], [0, 1], Extrapolation.CLAMP);
    const scale = initialOrbitScale + (revealScale - initialOrbitScale) * revealed;
    const translation = reducedMotion ? offset > reducedIntroEnd ? followDistance : reducedFollowDistance : interpolate(offset, [0, revealEnd, collapseEnd], [0, revealFollowDistance, followDistance], Extrapolation.CLAMP);
    const center = stageCenter + translation - offset;
    const extent = iconSize * scale * Math.SQRT1_2;
    return (reducedMotion ? offset <= reducedIntroEnd : offset < iconFadeEnd) && center + extent > 0 && center - extent < availableHeight;
  }, (visible, previous) => {
    if (visible !== previous) runOnJS(setCenterIconVisible)(visible);
  }, [reducedMotion, revealEnd, revealScale, reducedIntroEnd, followDistance, reducedFollowDistance, collapseEnd, revealFollowDistance, stageCenter, iconSize, iconFadeEnd, availableHeight]);
  const onScroll = useAnimatedScrollHandler(event => { scroll.set(Math.max(0, event.contentOffset.y)); });
  const introStyle = useAnimatedStyle(() => ({ opacity: reducedMotion ? Number(scroll.get() <= reducedIntroEnd) : interpolate(scroll.get(), [0, introFadeEnd], [1, 0], Extrapolation.CLAMP) }));
  const centerIconStyle = useAnimatedStyle(() => {
    const gathered = reducedMotion ? Number(scroll.get() > reducedIntroEnd) : interpolate(scroll.get(), [collapseStart, collapseEnd], [0, 1], Extrapolation.CLAMP);
    const revealed = reducedMotion ? 1 : interpolate(scroll.get(), [0, revealEnd], [0, 1], Extrapolation.CLAMP);
    const fade = interpolate(gathered, [0, .55], [1, 0], Extrapolation.CLAMP);
    return { opacity: fade * fade * (3 - 2 * fade), transform: [{ rotateZ: `${reducedMotion ? 0 : iconPhase.get()}deg` }, { scale: initialOrbitScale + (revealScale - initialOrbitScale) * revealed }] };
  });
  const stickyStage = useAnimatedStyle(() => ({ transform: [{ translateY: reducedMotion ? scroll.get() > (collapseStart + collapseEnd) / 2 ? followDistance : reducedFollowDistance : interpolate(scroll.get(), [0, revealEnd, collapseEnd], [0, revealFollowDistance, followDistance], Extrapolation.CLAMP) }] }));
  const goTo = (y: number) => scrollRef.current?.scrollTo({ y, animated: !reducedMotion });

  if (ready && state.session) return <Redirect href={state.session.onboarded ? `/discover` : `/onboarding`} />;
  return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.bg }}>
    <LandingHeader onHome={() => goTo(0)} />
    <Animated.ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={[`#F45B73`, `#F4506B`, `#EE3E66`]} locations={[0, .5, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ height: heroHeight, overflow: `hidden` }}>
          <Animated.View pointerEvents={introVisible ? `auto` : `none`} accessibilityElementsHidden={!introVisible} importantForAccessibility={introVisible ? `auto` : `no-hide-descendants`} onLayout={event => setHeadingHeight(event.nativeEvent.layout.height)} style={[styles.heroHeading, introStyle]}>
            <EntryReveal><Txt size={11} weight="semibold" color={ink} style={styles.eyebrow}>PREMIUM FEATURES, REASONABLE PRICING</Txt></EntryReveal>
            <View style={{ width: `100%`, maxWidth: 1020 }}>
              <EntryReveal delay={180}><Txt size={titleSize} weight="bold" color="#FFFFFF" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={mobile ? .85 : .65} style={[titleStyle, { textAlign: `center` }]}>You <Txt size={titleSize} weight="bold" color={ink} style={titleStyle}>will</Txt> love</Txt></EntryReveal>
              {mobile ? <>
                <EntryReveal delay={360}><Txt size={titleSize} weight="bold" color="#FFFFFF" style={[titleStyle, { textAlign: `center` }]}>The <Txt size={titleSize} weight="bold" color={ink} style={titleStyle}>cost</Txt></Txt></EntryReveal>
                <EntryReveal delay={540}><Txt size={titleSize} weight="bold" color="#FFFFFF" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.85} style={[titleStyle, { textAlign: `center` }]}>of love<Txt size={titleSize} weight="bold" color={ink} style={titleStyle}>.</Txt></Txt></EntryReveal>
              </> : <EntryReveal delay={360}><Txt size={titleSize} weight="bold" color="#FFFFFF" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.65} style={[titleStyle, { textAlign: `center` }]}>The <Txt size={titleSize} weight="bold" color={ink} style={titleStyle}>cost</Txt> of love<Txt size={titleSize} weight="bold" color={ink} style={titleStyle}>.</Txt></Txt></EntryReveal>}
            </View>
            <EntryReveal delay={mobile ? 720 : 540}><Txt size={16} color={ink} style={styles.heroDescription}>Leaving you more time to</Txt></EntryReveal>
            <SparkButton active={introVisible && !privacyOpen} onPress={() => router.push(`/sign-in`)} style={styles.heroButton} />
          </Animated.View>
          <Animated.View style={[styles.phoneStage, { top: stageCenter }, stickyStage]}>
            <Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.centerIcon, { width: iconSize, height: iconSize, marginLeft: -iconSize / 2, marginTop: -iconSize / 2 }, centerIconStyle]}><AppIcon size={iconSize} /></Animated.View>
            {orbitPhones.map((phone, index) => <OrbitPhone key={`${phone.model}-${index}`} index={index} width={phoneWidth} phase={phase} scroll={scroll} radius={orbitRadius} revealEnd={revealEnd} revealScale={revealScale} revealRadius={revealRadius} collapseStart={collapseStart} collapseEnd={collapseEnd} reducedMotion={reducedMotion} />)}
          </Animated.View>
          <View style={[styles.gatheredCopy, { top: copyTop }]}><Txt size={29} weight="bold" color={ink} style={{ textAlign: `center`, letterSpacing: -.9 }}>Different paths.{`\n`}One place to connect.</Txt><Txt size={13} color={ink} style={{ textAlign: `center`, marginTop: 8 }}>Discover. Find common ground. Say hello.</Txt></View>
        </View>
        <View style={styles.storySection}>
          <WordCircle active={circleVisible && !privacyOpen} />
          <Txt size={11} weight="semibold" color={ink} style={styles.eyebrow}>A LITTLE MORE YOU</Txt>
          <Txt size={Math.min(48, width * .09)} weight="bold" color={ink} style={styles.storyHeading}>Good things start{`\n`}with a hello.</Txt>
          <View style={styles.storyGrid}>{stories.map(story => <View key={story.title} style={[styles.storyCard, { minWidth: width > 760 ? 230 : undefined }]}><View style={styles.storyIcon}><Icon name={story.icon} color={ink} size={24} /></View><Txt size={20} weight="semibold" color={ink}>{story.title}</Txt><Txt size={14} color={ink} style={{ lineHeight: 24 }}>{story.description}</Txt></View>)}</View>
          <View style={styles.invitation}><Txt size={34} weight="bold" color={ink} style={{ textAlign: `center`, letterSpacing: -1.4 }}>Your next hello{`\n`}could be a good one.</Txt><Txt size={14} color={ink} style={{ textAlign: `center` }}>Start with {PLANS.free.daily} free XOs every day.</Txt><Button label="Find Your People" icon="arrow-right" onPress={() => router.push(`/sign-in`)} style={styles.heroButton} /></View>
        </View>
      </LinearGradient>
      <PricingComparison instructions={false} />
      <View style={[styles.footer, { backgroundColor: colors.surface, paddingBottom: Math.max(32, insets.bottom + 20) }]}>
        <View style={styles.footerInner}>
          <BrandMark size={29} />
          <Txt color={colors.muted} style={{ maxWidth: 430 }}>Real people. Brighter connections.{`\n`}Your people. Your pace.</Txt>
          <Row style={{ flexWrap: `wrap`, gap: 10 }}><Button label="How It Works" variant="ghost" onPress={() => goTo(heroHeight)} /><Button label="Privacy & Safety" variant="ghost" onPress={() => setPrivacyOpen(true)} /><Button label="Sign In" variant="ghost" onPress={() => router.push(`/sign-in`)} /><Button label="Back To Top" icon="arrow-up" variant="ghost" onPress={() => goTo(0)} /></Row>
          <View style={{ height: 1, backgroundColor: colors.border, alignSelf: `stretch` }} />
          <Txt size={12} color={colors.muted}>For adults 18+ · Two paths. One connection.</Txt>
          <Txt size={11} color={colors.muted}>App Store & Google Play · Coming Later</Txt>
          <Link href="https://piratechs.com" style={{ color: colors.accentText, fontSize: 12, paddingVertical: 8 }}>Designed by Piratechs ↗</Link>
        </View>
      </View>
    </Animated.ScrollView>
    <Modal visible={privacyOpen} transparent animationType={reducedMotion ? `none` : `fade`} onRequestClose={() => setPrivacyOpen(false)}>
      <View style={styles.modalBackdrop}><ScrollView style={{ width: `100%` }} contentContainerStyle={{ flexGrow: 1, paddingVertical: 16, alignItems: `center`, justifyContent: `center` }}><Panel style={{ width: `100%`, maxWidth: 490, gap: 17 }}><Icon name="shield" size={28} color={colors.accentText} /><Txt size={24} weight="semibold">A Little Space For Your Privacy</Txt><Txt color={colors.muted}>You choose the details and public links you share. Profiler visibility is opt-in. Blocking hides profiles from each other across the member experience.</Txt><Txt color={colors.muted}>Review your preferences and visibility controls in Settings. Blocking and reporting never cost XOs.</Txt><Txt size={12} color={colors.muted}>Share only what feels right for you. Keep sensitive contact details out of your public profile.</Txt><Button label="Got It" onPress={() => setPrivacyOpen(false)} /></Panel></ScrollView></View>
    </Modal>
  </View>;
};

const styles = StyleSheet.create({
  centerIcon: { top: 0, left: `50%`, zIndex: 0, position: `absolute` },
  phone: { top: 0, position: `absolute`, alignItems: `center` },
  phoneStage: { left: 0, right: 0, position: `absolute` },
  eyebrow: { textAlign: `center`, letterSpacing: 2 },
  heroHeading: { gap: 24, paddingTop: 40, paddingHorizontal: 16, alignItems: `center` },
  heroDescription: { textAlign: `center`, lineHeight: 25 },
  heroButton: { minHeight: 54, paddingHorizontal: 28, borderRadius: 30, backgroundColor: `#FFFFFF` },
  gatheredCopy: { left: 20, right: 20, position: `absolute` },
  storySection: { gap: 20, paddingHorizontal: 24, paddingTop: 35, paddingBottom: 60, maxWidth: 1180, alignSelf: `center`, width: `100%` },
  storyHeading: { lineHeight: 53, textAlign: `center`, letterSpacing: -1.5, marginBottom: 16 },
  storyGrid: { gap: 18, flexDirection: `row`, flexWrap: `wrap` },
  storyCard: { gap: 19, padding: 26, flexGrow: 1, flexBasis: 270, borderRadius: 27, borderWidth: 1, borderColor: `rgba(255,255,255,.65)`, backgroundColor: `rgba(255,255,255,.52)` },
  storyIcon: { width: 48, height: 48, borderRadius: 17, alignItems: `center`, justifyContent: `center`, backgroundColor: `rgba(255,255,255,.58)` },
  invitation: { gap: 20, paddingTop: 48, paddingBottom: 5, alignItems: `center` },
  footer: { paddingTop: 40, paddingHorizontal: 24 },
  footerInner: { gap: 23, width: `100%`, maxWidth: 1180, alignSelf: `center`, alignItems: `flex-start` },
  modalBackdrop: { flex: 1, padding: 24, alignItems: `center`, justifyContent: `center`, backgroundColor: `rgba(12,14,21,.7)` },
});
