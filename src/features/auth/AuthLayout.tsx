import { Icon } from '../../components/Icon';
import { useApp } from '../../state/AppProvider';
import { useAuthCarousel } from './useAuthCarousel';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt, Row, Button } from '../../components/ui';
import { BrandMark } from '../../components/BrandMark';
import { SymbolIcon } from '../../components/SymbolIcon';
import { Link, router, type LinkProps } from 'expo-router';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View, Platform, Animated, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, useWindowDimensions } from 'react-native';

const storyThemes = {
  light: {
    ink: `#252831`, coral: `#DB3555`, muted: `#6B5861`, card: `#FFFFFF`, soft: `#FFF1F4`,
    sent: `#FFE1E8`, orbit: `#DDAABB32`, button: `#FFFFFF80`, header: `#FFF2F1`, border: `#E9D4DE`,
    typing: `#BBA4AE`, success: `#35705B`, received: `#F4F1F5`, divider: `#DAB8C447`, pagination: `#CEABB8`,
    photoBorder: `#FFFFFF`, sparkBorder: `#FCE5EA`, controlBorder: `#D7B3C1`, subtleBorder: `#F0E6E9`,
    gradient: [`#FFF2F1`, `#FCE1E8`, `#F5DAE6`],
  },
  dark: {
    ink: `#FAFAFC`, coral: `#FF879B`, muted: `#C1AEBB`, card: `#30313D`, soft: `#44303C`,
    sent: `#543040`, orbit: `#FF91AC18`, button: `#FFFFFF0D`, header: `#20222C`, border: `#4B3A48`,
    typing: `#BA91A6`, success: `#7DD7AC`, received: `#3A3441`, divider: `#FFADC326`, pagination: `#795669`,
    photoBorder: `#3A3441`, sparkBorder: `#48333E`, controlBorder: `#795669`, subtleBorder: `#4B3A48`,
    gradient: [`#20222C`, `#28232E`, `#352631`],
  },
} as const;
type StoryTheme = (typeof storyThemes)[keyof typeof storyThemes];
const useStoryTheme = () => {
  const { dark } = useTheme();
  const mode = dark ? `dark` : `light`;
  return { theme: storyThemes[mode], styles: storyStyles[mode] };
};
const slides = [
  { id: `discover`, label: `Find Your People`, title: `Your kind of\npeople. Finally.`, description: `From coffee walks to your next adventure, discover people who love the little things you do.`, detail: `Shared interests. A little spark. A real hello.` },
  { id: `connect`, label: `Make The First Move`, title: `A little spark.\nA better hello.`, description: `Find your opening with your MXO wingmate, then keep the conversation going in one place.`, detail: `A helping hand when the right words get away.` },
  { id: `control`, label: `Keep It Comfortable`, title: `Your profile.\nYour own pace.`, description: `Set your preferences, choose what you share, and use block or report whenever you need to.`, detail: `More room to be yourself, from day one.` },
] as const;

const InterestPill = ({ icon, label }: { label: string; icon: `coffee` | `sun` | `music` }) => {
  const { theme, styles } = useStoryTheme();
  return <Row style={styles.interestPill}><Icon name={icon} size={14} color={theme.coral} /><Txt size={11} weight="medium" color={theme.ink}>{label}</Txt></Row>;
};

const DiscoverPreview = () => {
  const { theme, styles } = useStoryTheme();
  return <View style={styles.previewStage}>
    <View style={[styles.photoCard, styles.backPhoto]}><ProfilePhoto photo="ethan" /><LinearGradient colors={[`transparent`, `#252831C7`]} style={styles.photoShade}><Txt size={19} weight="semibold" color="#FFFFFF">Ethan, 28</Txt><Txt size={11} color="#FFFFFF">Always taking the scenic route</Txt></LinearGradient></View>
    <View style={[styles.photoCard, styles.frontPhoto]}><ProfilePhoto photo="maya" /><LinearGradient colors={[`transparent`, `#252831C7`]} style={styles.photoShade}><Txt size={19} weight="semibold" color="#FFFFFF">Maya, 28</Txt><Txt size={11} color="#FFFFFF">Coffee first. Adventure next.</Txt></LinearGradient></View>
    <View style={styles.sparkBadge}><Icon name="heart" size={27} color={theme.coral} /></View>
    <View style={styles.interestCard}><Txt size={10} weight="semibold" color={theme.muted} style={{ letterSpacing: 1.1 }}>COMMON GROUND</Txt><Row style={{ gap: 6 }}><InterestPill icon="coffee" label="Coffee" /><InterestPill icon="sun" label="Outdoors" /></Row></View>
  </View>;
};

const ConversationPreview = () => {
  const { theme, styles } = useStoryTheme();
  return <View style={styles.previewStage}>
    <View style={styles.conversationCard}>
      <Row style={{ paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.subtleBorder }}><View style={styles.chatAvatar}><ProfilePhoto photo="maya" /></View><View style={{ gap: 1 }}><Txt size={16} weight="semibold" color={theme.ink}>Maya</Txt><Txt size={11} color={theme.muted}>Start with something you share</Txt></View><View style={{ marginLeft: `auto` }}><Icon name="heart" size={18} color={theme.coral} /></View></Row>
      <View style={styles.receivedMessage}><Txt size={12} color={theme.ink}>The important question: coffee walk or a tiny bookshop?</Txt></View>
      <View style={[styles.sentMessage, { gap: 4, flexDirection: `row`, alignItems: `flex-end` }]}><Txt size={12} color={theme.ink} style={{ flexShrink: 1 }}>Why choose? Coffee on the way to the bookshop</Txt><SymbolIcon name={`coffee`} size={16} /></View>
      <Row style={{ gap: 4, paddingLeft: 6 }}>{[0, 1, 2].map(dot => <View key={dot} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: theme.typing }} />)}</Row>
    </View>
    <Row style={styles.wingmateCard}><View style={styles.wingmateIcon}><Icon name="zap" size={20} color={theme.coral} /></View><View style={{ flex: 1, gap: 2 }}><Txt size={12} weight="semibold" color={theme.ink}>Meet Your MXO Wingmate</Txt><Txt size={11} color={theme.muted}>A little help with your first hello</Txt></View></Row>
  </View>;
};

const ControlPreview = () => {
  const { theme, styles } = useStoryTheme();
  return <View style={styles.previewStage}>
    <View style={styles.preferenceCard}>
      <Row style={{ gap: 12, marginBottom: 8 }}><View style={[styles.wingmateIcon, { width: 46, height: 46, borderRadius: 16 }]}><Icon name="sliders" size={22} color={theme.coral} /></View><View><Txt size={17} weight="semibold" color={theme.ink}>Made For You</Txt><Txt size={11} color={theme.muted}>Your settings. Your say.</Txt></View></Row>
      {[{ icon: `eye`, label: `Choose What You Share`, detail: `Public links are opt-in` }, { icon: `sliders`, label: `Set Your Preferences`, detail: `Make discovery feel like you` }, { icon: `shield`, label: `Keep Your Boundaries`, detail: `Block and report controls` }].map(item => <Row key={item.label} style={{ gap: 12, paddingVertical: 10 }}><Icon name={item.icon as `eye` | `sliders` | `shield`} size={19} color={theme.coral} /><View style={{ flex: 1, gap: 1 }}><Txt size={12} weight="medium" color={theme.ink}>{item.label}</Txt><Txt size={10} color={theme.muted}>{item.detail}</Txt></View><Icon name="check" size={16} color={theme.success} /></Row>)}
    </View>
    <Row style={styles.comfortBadge}><Icon name="heart" size={17} color={theme.coral} /><Txt size={12} weight="medium" color={theme.ink}>Show Up As Yourself</Txt></Row>
  </View>;
};

const FeatureSlide = ({ slide, width, height, contentWidth }: { slide: (typeof slides)[number]; width: number; height: number; contentWidth: number }) => {
  const { theme, styles } = useStoryTheme();
  const compact = width < 1040;
  const artScale = Math.min(compact ? .86 : 1, (contentWidth - 8) / 330);
  const titleSize = compact ? width < 380 ? 30 : 34 : width < 1240 ? 38 : 46;
  return <View style={{ gap: compact ? 18 : 25 }}>
    <View accessibilityElementsHidden importantForAccessibility={`no-hide-descendants`} style={{ height: compact ? 272 * artScale + 6 : Math.min(310, Math.max(272, height * .34)), justifyContent: `center`, alignItems: `center` }}><View style={{ transform: [{ scale: artScale }] }}>{slide.id === `discover` ? <DiscoverPreview /> : slide.id === `connect` ? <ConversationPreview /> : <ControlPreview />}</View></View>
    <View style={{ gap: compact ? 12 : 14 }}><Row style={{ gap: 8 }}><View style={styles.labelDash} /><Txt size={11} weight={`semibold`} color={theme.coral} style={{ letterSpacing: 1.6 }}>{slide.label.toUpperCase()}</Txt></Row><Txt size={titleSize} weight={`bold`} color={theme.ink} style={{ lineHeight: titleSize + 8, letterSpacing: -1.5 }}>{slide.title}</Txt><Txt size={compact ? 13 : 14} color={theme.muted} style={{ lineHeight: compact ? 21 : 23, maxWidth: 410, minHeight: compact ? 63 : 69 }}>{slide.description}</Txt></View>
  </View>;
};

export const AuthLayout = ({ mode, children, contentKey }: { children: ReactNode; contentKey?: number; mode: `sign-in` | `sign-up` }) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const { theme, styles } = useStoryTheme();
  const [mobileHeaderHeight, setMobileHeaderHeight] = useState(69);
  const { act, ready, dismissNotice } = useApp();
  const formOffset = useRef(0);
  const formTarget = useRef<View>(null);
  const pageScroll = useRef<ScrollView>(null);
  const formScroll = useRef<ScrollView>(null);
  const previousContentKey = useRef(contentKey);
  const { width, height } = useWindowDimensions();
  const wide = width >= 1040;
  const availableHeight = Math.max(0, height - insets.top - insets.bottom - (wide ? 0 : mobileHeaderHeight));
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
  const themeToggle = <Pressable disabled={!ready} accessibilityRole={`button`} accessibilityState={{ disabled: !ready }} accessibilityLabel={dark ? `Switch To Light Mode` : `Switch To Dark Mode`} onPress={() => act({ type: `save-settings`, settings: { theme: dark ? `light` : `dark` } })} style={({ pressed }) => [styles.themeButton, { backgroundColor: wide ? colors.raised : theme.button, borderColor: wide ? colors.border : theme.controlBorder, opacity: pressed || !ready ? .6 : 1 }]}><Icon name={dark ? `sun` : `moon`} size={19} color={wide ? colors.muted : theme.ink} /></Pressable>;
  const homeLink = <Link href={`/`} replace asChild onPress={goHome}><Pressable accessible accessibilityRole={`link`} accessibilityLabel={`MatchXD Home`} style={styles.homeLink}><BrandMark size={25} color={theme.ink} /></Pressable></Link>;
  const storyContent = <View style={[styles.storyContent, { padding: wide ? width < 1240 ? 30 : 44 : formPadding, paddingTop: wide ? 32 : 20, minHeight: wide ? undefined : Math.min(740, availableHeight) }]}>
    {wide ? <Row style={{ justifyContent: `space-between`, gap: 10 }}>{homeLink}<View style={styles.agePill}><Txt size={10} weight={`medium`} color={theme.muted}>18+ COMMUNITY</Txt></View></Row> : null}
    <View style={[styles.storyCenter, !wide && { paddingVertical: 18 }]}>
      <View nativeID={`auth-carousel`} onLayout={carousel.onLayout} style={{ overflow: `hidden` }}>
        {carousel.width ? <Animated.View style={[carousel.railStyle, { pointerEvents: `none` }]}>{[slides[slides.length - 1], ...slides, slides[0]].map((item, position) => <View key={`${item.id}-${position}`} accessibilityElementsHidden={position !== index + 1} importantForAccessibility={position === index + 1 ? `auto` : `no-hide-descendants`} style={{ width: carousel.width }}><FeatureSlide slide={item} width={width} height={height} contentWidth={carousel.width} /></View>)}</Animated.View> : <FeatureSlide slide={slide} width={width} height={height} contentWidth={Math.max(240, width - formPadding * 2)} />}
      </View>
    </View>
    <View style={{ gap: wide ? 18 : 14 }}>
      <Row style={{ justifyContent: `space-between`, gap: 10 }}>
        <Row style={{ gap: 1 }}>{slides.map((item, position) => <Pressable key={item.id} accessibilityRole={`button`} accessibilityLabel={`Show Slide ${position + 1}: ${item.label}`} accessibilityState={{ selected: position === index }} onPress={() => showSlide(position)} style={styles.paginationTarget}><View style={{ height: 5, width: position === index ? 29 : 8, borderRadius: 5, backgroundColor: position === index ? theme.coral : theme.pagination }} /></Pressable>)}<Txt size={11} color={theme.muted} style={{ marginLeft: 7 }}>{`0${index + 1} / 0${slides.length}`}</Txt></Row>
        <Row style={{ gap: 5 }}><Pressable accessibilityRole={`button`} accessibilityLabel={`Previous Slide`} onPress={() => showSlide(index - 1)} style={({ pressed }) => [styles.storyControl, { opacity: pressed ? .6 : 1 }]}><Icon name={`arrow-left`} size={16} color={theme.ink} /></Pressable><Pressable accessibilityRole={`button`} accessibilityLabel={`Next Slide`} onPress={() => showSlide(index + 1)} style={({ pressed }) => [styles.storyControl, { opacity: pressed ? .6 : 1 }]}><Icon name={`arrow-right`} size={16} color={theme.ink} /></Pressable></Row>
      </Row>
      {wide ? <><View style={{ height: 1, backgroundColor: theme.divider }} /><Txt size={11} color={theme.muted} style={{ minHeight: 33 }}>{slide.detail}</Txt></> : <Button icon={`arrow-down`} label={mode === `sign-in` ? `Continue To Sign In` : `Set Up My Profile`} onPress={scrollToForm} />}
    </View>
  </View>;
  // The whole story panel handles dragging; only the slide viewport measures the rail width.
  const story = <View nativeID={`auth-story`} {...carousel.panHandlers} style={[styles.storyColumn, carousel.webStyle, { width: wide ? Math.min(720, width * .46) : `100%`, borderRightWidth: wide ? 1 : 0, borderBottomWidth: wide ? 0 : 1, borderBottomColor: theme.border }]}>
    <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} />
    <View style={[styles.largeOrbit, { pointerEvents: `none` }]} /><View style={[styles.smallOrbit, { pointerEvents: `none` }]} />
    {wide ? <ScrollView showsVerticalScrollIndicator={false} style={carousel.webStyle} contentContainerStyle={{ flexGrow: 1 }}>{storyContent}</ScrollView> : storyContent}
  </View>;
  const form = <View ref={formTarget} nativeID={`auth-form`} tabIndex={-1} onLayout={event => { if (!wide) formOffset.current = event.nativeEvent.layout.y; }} style={{ flexGrow: 1, width: `100%`, padding: formPadding, paddingTop: wide ? 26 : 32, justifyContent: `center`, minHeight: wide ? undefined : availableHeight, backgroundColor: dark ? colors.bg : colors.surface }}><View style={{ gap: 24, width: `100%`, maxWidth: mode === `sign-in` ? 490 : 600, alignSelf: `center`, paddingVertical: wide ? 8 : 12 }}>{children}</View></View>;

  return <KeyboardAvoidingView enabled={Platform.OS !== `web`} keyboardVerticalOffset={insets.top} behavior={Platform.OS === `ios` ? `padding` : `height`} style={{ flex: 1, backgroundColor: wide ? colors.surface : theme.header, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }}>
    {!wide ? <View nativeID={`auth-mobile-header`} onLayout={event => setMobileHeaderHeight(event.nativeEvent.layout.height)} style={[styles.mobileHeader, { paddingHorizontal: formPadding }]}><Row style={{ justifyContent: `space-between`, gap: 10 }}>{homeLink}{themeToggle}</Row></View> : null}
    {wide ? <View style={styles.layout}>{story}<View style={{ flex: 1, minWidth: 0, backgroundColor: dark ? colors.bg : colors.surface }}>
      <Row style={{ justifyContent: `flex-end`, paddingHorizontal: formPadding, paddingTop: 22, paddingBottom: 12 }}>{themeToggle}</Row>
      <ScrollView ref={formScroll} keyboardShouldPersistTaps={`handled`} keyboardDismissMode={`on-drag`} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>{form}</ScrollView>
    </View></View> : <ScrollView ref={pageScroll} nativeID={`auth-page-scroll`} keyboardShouldPersistTaps={`handled`} keyboardDismissMode={`on-drag`} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>{story}{form}</ScrollView>}
  </KeyboardAvoidingView>;
};

const createStyles = (theme: StoryTheme) => StyleSheet.create({
  layout: { flex: 1, flexDirection: `row` },
  mobileHeader: { zIndex: 10, flexShrink: 0, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.header },
  homeLink: { minHeight: 44, justifyContent: `center` },
  labelDash: { width: 21, height: 2, backgroundColor: theme.coral },
  themeButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 15, alignItems: `center`, justifyContent: `center` },
  storyColumn: { overflow: `hidden`, borderRightWidth: 1, borderRightColor: theme.border },
  storyCenter: { flex: 1, justifyContent: `center`, paddingVertical: 26 },
  storyContent: { flexGrow: 1, width: `100%`, maxWidth: 600, alignSelf: `center` },
  previewStage: { width: 330, height: 272, position: `relative`, alignItems: `center` },
  agePill: { borderWidth: 1, borderColor: theme.controlBorder, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10 },
  photoCard: { position: `absolute`, width: 169, height: 218, borderRadius: 21, borderWidth: 5, borderColor: theme.photoBorder, overflow: `hidden`, boxShadow: `0px 15px 35px #7D335423` },
  backPhoto: { top: 11, right: 14, transform: [{ rotate: `10deg` }] },
  frontPhoto: { top: 28, left: 16, transform: [{ rotate: `-9deg` }] },
  photoShade: { position: `absolute`, bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 42 },
  sparkBadge: { position: `absolute`, top: 14, left: 135, width: 56, height: 56, borderRadius: 28, borderWidth: 5, borderColor: theme.sparkBorder, backgroundColor: theme.card, justifyContent: `center`, alignItems: `center`, transform: [{ rotate: `12deg` }] },
  interestCard: { position: `absolute`, bottom: 0, right: 0, gap: 8, padding: 13, borderRadius: 17, backgroundColor: theme.card, boxShadow: `0px 10px 30px #7D335417` },
  interestPill: { gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.soft },
  conversationCard: { top: 4, width: 290, gap: 13, padding: 20, paddingBottom: 34, borderRadius: 24, backgroundColor: theme.card, transform: [{ rotate: `-3deg` }], boxShadow: `0px 15px 35px #7D335417` },
  chatAvatar: { width: 39, height: 39, borderRadius: 20, overflow: `hidden` },
  receivedMessage: { maxWidth: 218, padding: 11, borderRadius: 13, borderBottomLeftRadius: 3, backgroundColor: theme.received },
  sentMessage: { maxWidth: 215, padding: 11, borderRadius: 13, borderBottomRightRadius: 3, alignSelf: `flex-end`, backgroundColor: theme.sent },
  wingmateCard: { position: `absolute`, bottom: 0, right: 0, gap: 11, width: 275, padding: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 17, backgroundColor: theme.card, transform: [{ rotate: `3deg` }], boxShadow: `0px 10px 25px #7D335413` },
  wingmateIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.soft, alignItems: `center`, justifyContent: `center` },
  preferenceCard: { top: 6, width: 285, padding: 22, borderRadius: 24, backgroundColor: theme.card, transform: [{ rotate: `-4deg` }], boxShadow: `0px 15px 35px #7D335417` },
  comfortBadge: { position: `absolute`, bottom: 1, right: 0, gap: 9, padding: 15, borderWidth: 1, borderColor: theme.border, borderRadius: 17, backgroundColor: theme.card, transform: [{ rotate: `4deg` }] },
  storyControl: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.controlBorder, alignItems: `center`, justifyContent: `center` },
  paginationTarget: { minWidth: 27, minHeight: 44, paddingHorizontal: 3, alignItems: `center`, justifyContent: `center` },
  largeOrbit: { position: `absolute`, width: 780, height: 780, top: -255, left: -254, borderRadius: 390, borderWidth: 1, borderColor: theme.orbit },
  smallOrbit: { position: `absolute`, width: 620, height: 620, top: -173, left: -172, borderRadius: 310, borderWidth: 1, borderColor: theme.orbit },
});

const storyStyles = { light: createStyles(storyThemes.light), dark: createStyles(storyThemes.dark) };
