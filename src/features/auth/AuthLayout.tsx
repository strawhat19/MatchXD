import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { useAuthCarousel } from './useAuthCarousel';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt, Row, Button } from '../../components/ui';
import { BrandMark } from '../../components/BrandMark';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, router, type LinkProps } from 'expo-router';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Platform, Animated, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, useWindowDimensions } from 'react-native';

const ink = `#252831`;
const coral = `#DB3555`;
const muted = `#6B5861`;
const slides = [
  { id: `discover`, label: `Find Your People`, title: `Your kind of\npeople. Finally.`, description: `From coffee walks to your next adventure, discover people who love the little things you do.`, detail: `Shared interests. A little spark. A real hello.` },
  { id: `connect`, label: `Make The First Move`, title: `A little spark.\nA better hello.`, description: `Find your opening with your MXO wingmate, then keep the conversation going in one place.`, detail: `A helping hand when the right words get away.` },
  { id: `control`, label: `Keep It Comfortable`, title: `Your profile.\nYour own pace.`, description: `Set your preferences, choose what you share, and use block or report whenever you need to.`, detail: `More room to be yourself, from day one.` },
] as const;

const InterestPill = ({ icon, label }: { label: string; icon: `coffee` | `sun` | `music` }) => <Row style={styles.interestPill}><Icon name={icon} size={14} color={coral} /><Txt size={11} weight="medium" color={ink}>{label}</Txt></Row>;

const DiscoverPreview = () => <View style={styles.previewStage}>
  <View style={[styles.photoCard, styles.backPhoto]}><ProfilePhoto photo="ethan" /><LinearGradient colors={[`transparent`, `#252831C7`]} style={styles.photoShade}><Txt size={19} weight="semibold" color="#FFFFFF">Ethan, 28</Txt><Txt size={11} color="#FFFFFF">Always taking the scenic route</Txt></LinearGradient></View>
  <View style={[styles.photoCard, styles.frontPhoto]}><ProfilePhoto photo="maya" /><LinearGradient colors={[`transparent`, `#252831C7`]} style={styles.photoShade}><Txt size={19} weight="semibold" color="#FFFFFF">Maya, 28</Txt><Txt size={11} color="#FFFFFF">Coffee first. Adventure next.</Txt></LinearGradient></View>
  <View style={styles.sparkBadge}><Icon name="heart" size={27} color={coral} /></View>
  <View style={styles.interestCard}><Txt size={10} weight="semibold" color={muted} style={{ letterSpacing: 1.1 }}>COMMON GROUND</Txt><Row style={{ gap: 6 }}><InterestPill icon="coffee" label="Coffee" /><InterestPill icon="sun" label="Outdoors" /></Row></View>
</View>;

const ConversationPreview = () => <View style={styles.previewStage}>
  <View style={styles.conversationCard}>
    <Row style={{ paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: `#F0E6E9` }}><View style={styles.chatAvatar}><ProfilePhoto photo="maya" /></View><View style={{ gap: 1 }}><Txt size={16} weight="semibold" color={ink}>Maya</Txt><Txt size={11} color={muted}>Start with something you share</Txt></View><View style={{ marginLeft: `auto` }}><Icon name="heart" size={18} color={coral} /></View></Row>
    <View style={styles.receivedMessage}><Txt size={12} color={ink}>The important question: coffee walk or a tiny bookshop?</Txt></View>
    <View style={styles.sentMessage}><Txt size={12} color={ink}>Why choose? Coffee on the way to the bookshop ☕</Txt></View>
    <Row style={{ gap: 4, paddingLeft: 6 }}>{[0, 1, 2].map(dot => <View key={dot} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: `#BBA4AE` }} />)}</Row>
  </View>
  <Row style={styles.wingmateCard}><View style={styles.wingmateIcon}><Icon name="zap" size={20} color={coral} /></View><View style={{ flex: 1, gap: 2 }}><Txt size={12} weight="semibold" color={ink}>Meet Your MXO Wingmate</Txt><Txt size={11} color={muted}>A little help with your first hello</Txt></View></Row>
</View>;

const ControlPreview = () => <View style={styles.previewStage}>
  <View style={styles.preferenceCard}>
    <Row style={{ gap: 12, marginBottom: 8 }}><View style={[styles.wingmateIcon, { width: 46, height: 46, borderRadius: 16 }]}><Icon name="sliders" size={22} color={coral} /></View><View><Txt size={17} weight="semibold" color={ink}>Made For You</Txt><Txt size={11} color={muted}>Your settings. Your say.</Txt></View></Row>
    {[{ icon: `eye`, label: `Choose What You Share`, detail: `Public links are opt-in` }, { icon: `sliders`, label: `Set Your Preferences`, detail: `Make discovery feel like you` }, { icon: `shield`, label: `Keep Your Boundaries`, detail: `Block and report controls` }].map(item => <Row key={item.label} style={{ gap: 12, paddingVertical: 10 }}><Icon name={item.icon as `eye` | `sliders` | `shield`} size={19} color={coral} /><View style={{ flex: 1, gap: 1 }}><Txt size={12} weight="medium" color={ink}>{item.label}</Txt><Txt size={10} color={muted}>{item.detail}</Txt></View><Icon name="check" size={16} color="#35705B" /></Row>)}
  </View>
  <Row style={styles.comfortBadge}><Icon name="heart" size={17} color={coral} /><Txt size={12} weight="medium" color={ink}>Show Up As Yourself</Txt></Row>
</View>;

const FeatureSlide = ({ slide, width, height, contentWidth }: { slide: (typeof slides)[number]; width: number; height: number; contentWidth: number }) => {
  const compact = width < 1040;
  const artScale = Math.min(compact ? .86 : 1, (contentWidth - 8) / 330);
  const titleSize = compact ? width < 380 ? 30 : 34 : width < 1240 ? 38 : 46;
  return <View style={{ gap: compact ? 18 : 25 }}>
    <View accessibilityElementsHidden importantForAccessibility={`no-hide-descendants`} style={{ height: compact ? 272 * artScale + 6 : Math.min(310, Math.max(272, height * .34)), justifyContent: `center`, alignItems: `center` }}><View style={{ transform: [{ scale: artScale }] }}>{slide.id === `discover` ? <DiscoverPreview /> : slide.id === `connect` ? <ConversationPreview /> : <ControlPreview />}</View></View>
    <View style={{ gap: compact ? 12 : 14 }}><Row style={{ gap: 8 }}><View style={styles.labelDash} /><Txt size={11} weight={`semibold`} color={coral} style={{ letterSpacing: 1.6 }}>{slide.label.toUpperCase()}</Txt></Row><Txt size={titleSize} weight={`bold`} color={ink} style={{ lineHeight: titleSize + 8, letterSpacing: -1.5 }}>{slide.title}</Txt><Txt size={compact ? 13 : 14} color={muted} style={{ lineHeight: compact ? 21 : 23, maxWidth: 410, minHeight: compact ? 63 : 69 }}>{slide.description}</Txt></View>
  </View>;
};

export const AuthLayout = ({ mode, children, contentKey }: { children: ReactNode; contentKey?: number; mode: `sign-in` | `sign-up` }) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const { act, ready, dismissNotice } = useApp();
  const formOffset = useRef(0);
  const formTarget = useRef<View>(null);
  const pageScroll = useRef<ScrollView>(null);
  const formScroll = useRef<ScrollView>(null);
  const previousContentKey = useRef(contentKey);
  const { width, height } = useWindowDimensions();
  const wide = width >= 1040;
  const formPadding = wide ? 40 : width < 480 ? 20 : 32;
  const carousel = useAuthCarousel(slides.length, true);
  const { index, showSlide } = carousel;
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    if (previousContentKey.current === contentKey) return;
    previousContentKey.current = contentKey;
    if (wide) formScroll.current?.scrollTo({ y: 0, animated: false });
    else pageScroll.current?.scrollTo({ y: formOffset.current, animated: false });
  }, [contentKey, wide]);

  const goHome: NonNullable<LinkProps['onPress']> = event => {
    if (event.defaultPrevented) return;
    if (`button` in event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)) return;
    event.preventDefault();
    dismissNotice();
    act({ type: `cancel-onboarding` });
    router.replace(`/`);
  };
  const scrollToForm = () => {
    if (Platform.OS === `web`) (formTarget.current as unknown as HTMLElement | null)?.focus({ preventScroll: true });
    pageScroll.current?.scrollTo({ y: formOffset.current, animated: !carousel.reducedMotion });
  };
  const themeToggle = <Pressable disabled={!ready} accessibilityRole={`button`} accessibilityState={{ disabled: !ready }} accessibilityLabel={dark ? `Switch To Light Mode` : `Switch To Dark Mode`} onPress={() => act({ type: `save-settings`, settings: { theme: dark ? `light` : `dark` } })} style={({ pressed }) => [styles.themeButton, { backgroundColor: wide ? colors.raised : `#FFFFFF80`, borderColor: wide ? colors.border : `#DFC4CE`, opacity: pressed || !ready ? .6 : 1 }]}><Icon name={dark ? `sun` : `moon`} size={19} color={wide ? colors.muted : ink} /></Pressable>;
  const storyContent = <View style={[styles.storyContent, { padding: wide ? width < 1240 ? 30 : 44 : formPadding, paddingTop: wide ? 32 : 20, minHeight: wide ? undefined : Math.min(740, height - insets.top - insets.bottom) }]}>
    <Row style={{ justifyContent: `space-between`, gap: 10 }}><Link href={`/`} replace asChild onPress={goHome}><Pressable accessible accessibilityRole={`link`} accessibilityLabel={`MatchXD Home`} style={styles.homeLink}><BrandMark size={25} color={ink} /></Pressable></Link>{wide ? <View style={styles.agePill}><Txt size={10} weight={`medium`} color={muted}>18+ COMMUNITY</Txt></View> : themeToggle}</Row>
    <View style={[styles.storyCenter, !wide && { paddingVertical: 18 }]}>
      <View nativeID={`auth-carousel`} onLayout={carousel.onLayout} {...carousel.panHandlers} style={[{ overflow: `hidden` }, carousel.webStyle]}>
        {carousel.width ? <Animated.View pointerEvents={`none`} style={carousel.railStyle}>{[slides[slides.length - 1], ...slides, slides[0]].map((item, position) => <View key={`${item.id}-${position}`} accessibilityElementsHidden={position !== index + 1} importantForAccessibility={position === index + 1 ? `auto` : `no-hide-descendants`} style={{ width: carousel.width }}><FeatureSlide slide={item} width={width} height={height} contentWidth={carousel.width} /></View>)}</Animated.View> : <FeatureSlide slide={slide} width={width} height={height} contentWidth={Math.max(240, width - formPadding * 2)} />}
      </View>
    </View>
    <View style={{ gap: wide ? 18 : 14 }}>
      <Row style={{ justifyContent: `space-between`, gap: 10 }}>
        <Row style={{ gap: 1 }}>{slides.map((item, position) => <Pressable key={item.id} accessibilityRole={`button`} accessibilityLabel={`Show Slide ${position + 1}: ${item.label}`} accessibilityState={{ selected: position === index }} onPress={() => showSlide(position)} style={styles.paginationTarget}><View style={{ height: 5, width: position === index ? 29 : 8, borderRadius: 5, backgroundColor: position === index ? coral : `#CEABB8` }} /></Pressable>)}<Txt size={11} color={muted} style={{ marginLeft: 7 }}>{`0${index + 1} / 0${slides.length}`}</Txt></Row>
        <Row style={{ gap: 5 }}><Pressable accessibilityRole={`button`} accessibilityLabel={`Previous Slide`} onPress={() => showSlide(index - 1)} style={({ pressed }) => [styles.storyControl, { opacity: pressed ? .6 : 1 }]}><Icon name={`arrow-left`} size={16} color={ink} /></Pressable><Pressable accessibilityRole={`button`} accessibilityLabel={`Next Slide`} onPress={() => showSlide(index + 1)} style={({ pressed }) => [styles.storyControl, { opacity: pressed ? .6 : 1 }]}><Icon name={`arrow-right`} size={16} color={ink} /></Pressable></Row>
      </Row>
      {wide ? <><View style={{ height: 1, backgroundColor: `#DAB8C447` }} /><Txt size={11} color={muted} style={{ minHeight: 33 }}>{slide.detail}</Txt></> : <Button icon={`arrow-down`} label={mode === `sign-in` ? `Continue To Sign In` : `Set Up My Profile`} onPress={scrollToForm} />}
    </View>
  </View>;
  const story = <View style={[styles.storyColumn, { width: wide ? Math.min(720, width * .46) : `100%`, borderRightWidth: wide ? 1 : 0, borderBottomWidth: wide ? 0 : 1, borderBottomColor: `#E9D4DE` }]}>
    <LinearGradient colors={[`#FFF2F1`, `#FCE1E8`, `#F5DAE6`]} style={StyleSheet.absoluteFill} />
    <View pointerEvents={`none`} style={styles.largeOrbit} /><View pointerEvents={`none`} style={styles.smallOrbit} />
    {wide ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>{storyContent}</ScrollView> : storyContent}
  </View>;
  const form = <View ref={formTarget} nativeID={`auth-form`} tabIndex={-1} onLayout={event => { if (!wide) formOffset.current = event.nativeEvent.layout.y; }} style={{ flexGrow: 1, width: `100%`, padding: formPadding, paddingTop: wide ? 26 : 32, justifyContent: `center`, minHeight: wide ? undefined : height - insets.top - insets.bottom, backgroundColor: dark ? colors.bg : colors.surface }}><View style={{ gap: 24, width: `100%`, maxWidth: mode === `sign-in` ? 490 : 600, alignSelf: `center`, paddingVertical: wide ? 8 : 12 }}>{children}</View></View>;

  return <KeyboardAvoidingView enabled={Platform.OS !== `web`} keyboardVerticalOffset={insets.top} behavior={Platform.OS === `ios` ? `padding` : `height`} style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}>
    {wide ? <View style={styles.layout}>{story}<View style={{ flex: 1, minWidth: 0, backgroundColor: dark ? colors.bg : colors.surface }}>
      <Row style={{ justifyContent: `flex-end`, paddingHorizontal: formPadding, paddingTop: 22, paddingBottom: 12 }}>{themeToggle}</Row>
      <ScrollView ref={formScroll} keyboardShouldPersistTaps={`handled`} keyboardDismissMode={`on-drag`} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>{form}</ScrollView>
    </View></View> : <ScrollView ref={pageScroll} nativeID={`auth-page-scroll`} keyboardShouldPersistTaps={`handled`} keyboardDismissMode={`on-drag`} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>{story}{form}</ScrollView>}
  </KeyboardAvoidingView>;
};

const styles = StyleSheet.create({
  layout: { flex: 1, flexDirection: `row` },
  homeLink: { minHeight: 44, justifyContent: `center` },
  labelDash: { width: 21, height: 2, backgroundColor: coral },
  themeButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 15, alignItems: `center`, justifyContent: `center` },
  storyColumn: { overflow: `hidden`, borderRightWidth: 1, borderRightColor: `#E9D4DE` },
  storyCenter: { flex: 1, justifyContent: `center`, paddingVertical: 26 },
  storyContent: { flexGrow: 1, width: `100%`, maxWidth: 600, alignSelf: `center` },
  previewStage: { width: 330, height: 272, position: `relative`, alignItems: `center` },
  agePill: { borderWidth: 1, borderColor: `#DFC4CE`, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10 },
  photoCard: { position: `absolute`, width: 169, height: 218, borderRadius: 21, borderWidth: 5, borderColor: `#FFFFFF`, overflow: `hidden`, boxShadow: `0px 15px 35px #7D335423` },
  backPhoto: { top: 11, right: 14, transform: [{ rotate: `10deg` }] },
  frontPhoto: { top: 28, left: 16, transform: [{ rotate: `-9deg` }] },
  photoShade: { position: `absolute`, bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 42 },
  sparkBadge: { position: `absolute`, top: 14, left: 135, width: 56, height: 56, borderRadius: 28, borderWidth: 5, borderColor: `#FCE5EA`, backgroundColor: `#FFFFFF`, justifyContent: `center`, alignItems: `center`, transform: [{ rotate: `12deg` }] },
  interestCard: { position: `absolute`, bottom: 0, right: 0, gap: 8, padding: 13, borderRadius: 17, backgroundColor: `#FFFFFF`, boxShadow: `0px 10px 30px #7D335417` },
  interestPill: { gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: `#FFF1F4` },
  conversationCard: { top: 4, width: 290, gap: 13, padding: 20, paddingBottom: 34, borderRadius: 24, backgroundColor: `#FFFFFF`, transform: [{ rotate: `-3deg` }], boxShadow: `0px 15px 35px #7D335417` },
  chatAvatar: { width: 39, height: 39, borderRadius: 20, overflow: `hidden` },
  receivedMessage: { maxWidth: 218, padding: 11, borderRadius: 13, borderBottomLeftRadius: 3, backgroundColor: `#F4F1F5` },
  sentMessage: { maxWidth: 215, padding: 11, borderRadius: 13, borderBottomRightRadius: 3, alignSelf: `flex-end`, backgroundColor: `#FFE1E8` },
  wingmateCard: { position: `absolute`, bottom: 0, right: 0, gap: 11, width: 275, padding: 13, borderWidth: 1, borderColor: `#EAD6DE`, borderRadius: 17, backgroundColor: `#FFFFFF`, transform: [{ rotate: `3deg` }], boxShadow: `0px 10px 25px #7D335413` },
  wingmateIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: `#FFF0F4`, alignItems: `center`, justifyContent: `center` },
  preferenceCard: { top: 6, width: 285, padding: 22, borderRadius: 24, backgroundColor: `#FFFFFF`, transform: [{ rotate: `-4deg` }], boxShadow: `0px 15px 35px #7D335417` },
  comfortBadge: { position: `absolute`, bottom: 1, right: 0, gap: 9, padding: 15, borderWidth: 1, borderColor: `#EBD0DB`, borderRadius: 17, backgroundColor: `#FFFFFF`, transform: [{ rotate: `4deg` }] },
  storyControl: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: `#D7B3C1`, alignItems: `center`, justifyContent: `center` },
  paginationTarget: { minWidth: 27, minHeight: 44, paddingHorizontal: 3, alignItems: `center`, justifyContent: `center` },
  largeOrbit: { position: `absolute`, width: 780, height: 780, top: -255, left: -254, borderRadius: 390, borderWidth: 1, borderColor: `#DDAABB32` },
  smallOrbit: { position: `absolute`, width: 620, height: 620, top: -173, left: -172, borderRadius: 310, borderWidth: 1, borderColor: `#DDAABB32` },
});
