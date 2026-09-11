import { View } from 'react-native';
import { Txt } from '../../components/ui';
import Svg, { Path } from 'react-native-svg';
import { palettes } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, IconName } from '../../components/Icon';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { previewPeople, type PreviewPerson } from './phoneOrbit';
import { AppIcon, ConnectedX } from '../../components/BrandMark';

export type PhoneScreen = `discover` | `mxo` | `messages`;
export type PhoneModel = `iphone17` | `pro` | `promax`;
export type PhonePreviewProps = { screen: PhoneScreen; model: PhoneModel; width?: number; person?: number };

const colors = palettes.light;
const devices: Record<PhoneModel, { name: string; edge: string; rim: string; highlight: string }> = {
  iphone17: { name: `iPhone 17`, edge: `#899789`, rim: `#C4D1BD`, highlight: `#F1F5E9` },
  pro: { name: `iPhone 17 Pro`, edge: `#956D55`, rim: `#C98D63`, highlight: `#F7D4B6` },
  promax: { name: `iPhone 17 Pro Max`, edge: `#8F949B`, rim: `#D7DADF`, highlight: `#FFFFFF` },
};

const StatusBar = ({ s }: { s: number }) => <View style={{ height: 33 * s, paddingHorizontal: 19 * s, paddingTop: 11 * s, flexDirection: `row`, justifyContent: `space-between`, alignItems: `center` }}>
  <Txt size={9 * s} weight={`semibold`} color={colors.text}>9:41</Txt>
  <View style={{ gap: 4 * s, flexDirection: `row`, alignItems: `center` }}>
    <View style={{ height: 8 * s, gap: 1.4 * s, flexDirection: `row`, alignItems: `flex-end` }}>{[3, 4.5, 6, 8].map(height => <View key={height} style={{ width: 1.7 * s, height: height * s, borderRadius: s, backgroundColor: colors.text }} />)}</View>
    <Icon name={`wifi`} size={9 * s} color={colors.text} />
    <View style={{ width: 15 * s, height: 8 * s, padding: 1.1 * s, borderWidth: .8 * s, borderColor: colors.text, borderRadius: 2.5 * s }}><View style={{ height: `100%`, width: `88%`, backgroundColor: colors.text, borderRadius: s }} /><View style={{ position: `absolute`, right: -2.7 * s, top: 2 * s, height: 3 * s, width: 1.5 * s, borderRadius: s, backgroundColor: colors.text }} /></View>
  </View>
</View>;

const AppHeader = ({ s }: { s: number }) => <View style={{ height: 47 * s, paddingHorizontal: 15 * s, alignItems: `center`, justifyContent: `space-between`, flexDirection: `row` }}>
  <AppIcon size={27 * s} />
  <View style={{ gap: 11 * s, alignItems: `center`, flexDirection: `row` }}>
    <View style={{ gap: 4 * s, paddingHorizontal: 9 * s, paddingVertical: 5 * s, alignItems: `center`, flexDirection: `row`, borderRadius: 20 * s, backgroundColor: colors.surface, borderWidth: .8 * s, borderColor: colors.border }}><Txt size={8 * s} weight={`semibold`} color={colors.text}>33 XOs</Txt></View>
    <Icon name={`sun`} size={13 * s} color={colors.muted} />
  </View>
</View>;

const BottomNav = ({ s, screen }: { s: number; screen: PhoneScreen }) => {
  const items: { label: string; icon: IconName; active: boolean }[] = [
    { label: `Discover`, icon: `compass`, active: screen === `discover` },
    { label: `Matches`, icon: `heart`, active: screen === `messages` },
    { label: `MXO`, icon: `zap`, active: screen === `mxo` },
    { label: `Profiler`, icon: `search`, active: false },
    { label: `Profile`, icon: `user`, active: false },
  ];
  return <View style={{ backgroundColor: colors.surface, borderTopWidth: .7 * s, borderColor: colors.border }}>
    <View style={{ paddingTop: 9 * s, paddingBottom: 7 * s, flexDirection: `row`, justifyContent: `space-around` }}>{items.map(item => <View key={item.label} style={{ gap: 3 * s, alignItems: `center` }}><Icon name={item.icon} size={15 * s} color={item.active ? colors.accent : colors.muted} /><Txt size={6.3 * s} weight={item.active ? `semibold` : `regular`} color={item.active ? colors.accentText : colors.muted}>{item.label}</Txt></View>)}</View>
    <View style={{ height: 13 * s, alignItems: `center`, justifyContent: `center` }}><View style={{ width: 78 * s, height: 3.2 * s, borderRadius: 3 * s, backgroundColor: `#1C1D22` }} /></View>
  </View>;
};

const DiscoverPreview = ({ s, person }: { s: number; person: PreviewPerson }) => <View style={{ flex: 1, gap: 10 * s, paddingBottom: 12 * s, paddingHorizontal: 14 * s }}>
  <View style={{ flexDirection: `row`, alignItems: `center`, justifyContent: `space-between` }}><View><Txt size={20 * s} weight={`bold`} color={colors.text} style={{ letterSpacing: -.7 * s }}>Discover</Txt><Txt size={7.5 * s} color={colors.muted}>{person.city}, NY · Close to you</Txt></View><View style={{ padding: 7 * s, backgroundColor: colors.surface, borderWidth: .8 * s, borderColor: colors.border, borderRadius: 9 * s }}><Icon name={`sliders`} size={12 * s} color={colors.text} /></View></View>
  <View style={{ flex: 1, minHeight: 0, borderRadius: 17 * s, overflow: `hidden`, backgroundColor: `#C2B7A7` }}>
    <ProfilePhoto photo={person.photo} />
    <View style={{ position: `absolute`, top: 9 * s, left: 10 * s, right: 10 * s, flexDirection: `row`, gap: 3 * s }}>{[1, 2, 3].map(part => <View key={part} style={{ flex: 1, height: 2 * s, borderRadius: s, backgroundColor: part === 1 ? `#FFFFFF` : `rgba(255,255,255,.4)` }} />)}</View>
    <LinearGradient colors={[`transparent`, `rgba(17,20,28,.90)`]} style={{ position: `absolute`, bottom: 0, left: 0, right: 0, paddingHorizontal: 14 * s, paddingBottom: 15 * s, paddingTop: 62 * s, gap: 4 * s }}>
      <Txt size={24 * s} weight={`bold`} color={`#FFFFFF`} style={{ letterSpacing: -.8 * s }}>{person.name}, {person.age}</Txt>
      <View style={{ flexDirection: `row`, gap: 4 * s, alignItems: `center` }}><Icon name={`map-pin`} size={8 * s} color={`#F6F6F8`} /><Txt size={8 * s} color={`#F6F6F8`}>{person.city} · 3 miles away</Txt></View>
      <View style={{ flexDirection: `row`, gap: 4 * s, marginTop: 4 * s }}>{person.interests.map(label => <View key={label} style={{ backgroundColor: `rgba(255,255,255,.14)`, borderWidth: .7 * s, borderColor: `rgba(255,255,255,.27)`, borderRadius: 15 * s, paddingHorizontal: 8 * s, paddingVertical: 4 * s }}><Txt size={7 * s} color={`#FFFFFF`}>{label}</Txt></View>)}</View>
    </LinearGradient>
  </View>
  <View style={{ flexDirection: `row`, alignItems: `center`, justifyContent: `center`, gap: 12 * s, paddingTop: 2 * s }}>
    <View style={{ width: 44 * s, height: 44 * s, alignItems: `center`, justifyContent: `center`, borderWidth: .8 * s, borderColor: colors.border, borderRadius: 22 * s, backgroundColor: colors.surface }}><Icon name={`rotate-ccw`} size={13 * s} color={colors.muted} /></View>
    <View style={{ width: 44 * s, height: 44 * s, alignItems: `center`, justifyContent: `center`, borderWidth: .8 * s, borderColor: colors.border, borderRadius: 22 * s, backgroundColor: colors.surface }}><ConnectedX size={23 * s} /></View>
    <View style={{ width: 44 * s, height: 44 * s, alignItems: `center`, justifyContent: `center`, borderRadius: 22 * s, backgroundColor: colors.accent, boxShadow: `0 ${4 * s}px ${12 * s}px rgba(249,78,103,.23)` }}><Svg width={28 * s} height={28 * s} viewBox="0 0 32 32"><Path fill="#FFFFFF" d="M16 28.2C15.4 28.2 14.8 28 14.3 27.6L5.4 19.2C2.7 16.7 1.3 14.1 1.3 11.2C1.3 6.6 4.7 3.2 9.1 3.2C12 3.2 14.1 4.4 15.3 6Q16 6.9 16.7 6C17.9 4.4 20 3.2 22.9 3.2C27.3 3.2 30.7 6.6 30.7 11.2C30.7 14.1 29.3 16.7 26.6 19.2L17.7 27.6C17.2 28 16.6 28.2 16 28.2Z" /></Svg></View>
    <View style={{ width: 44 * s, height: 44 * s, alignItems: `center`, justifyContent: `center`, borderWidth: .8 * s, borderColor: colors.border, borderRadius: 22 * s, backgroundColor: colors.surface }}><Icon name={`star`} size={14 * s} color={colors.accent} /></View>
  </View>
</View>;

const MxoPreview = ({ s, person }: { s: number; person: PreviewPerson }) => <View style={{ flex: 1, paddingHorizontal: 14 * s, gap: 11 * s }}>
  <View><Txt size={8 * s} color={colors.accentText} weight={`semibold`} style={{ letterSpacing: 1.2 * s }}>MEET YOUR WINGMATE</Txt><Txt size={20 * s} weight={`bold`} color={colors.text} style={{ letterSpacing: -.7 * s, marginTop: 3 * s }}>A little common ground.</Txt></View>
  <View style={{ alignSelf: `flex-end`, backgroundColor: colors.accent, borderRadius: 14 * s, borderBottomRightRadius: 4 * s, maxWidth: `87%`, padding: 11 * s }}><Txt size={9 * s} color={colors.onAccent}>{person.mxoPrompt ?? `Help me find a little common ground.`}</Txt></View>
  <View style={{ gap: 7 * s }}>
    <View style={{ flexDirection: `row`, alignItems: `center`, gap: 5 * s }}><View style={{ width: 21 * s, height: 21 * s, backgroundColor: colors.pale, borderRadius: 8 * s, alignItems: `center`, justifyContent: `center` }}><Icon name={`zap`} size={11 * s} color={colors.accentText} /></View><Txt size={8 * s} weight={`semibold`} color={colors.accentText}>MXO · Your Wingmate</Txt></View>
    <Txt size={9 * s} color={colors.muted}>{person.mxoReply ?? `Ask ${person.name} about ${person.interests[0]?.toLowerCase()}. There’s your first hello.`}</Txt>
  </View>
  <View style={{ flex: 1, minHeight: 0, backgroundColor: colors.surface, borderRadius: 15 * s, borderWidth: .8 * s, borderColor: colors.border, overflow: `hidden` }}>
    <View style={{ flex: 1, minHeight: 0 }}><ProfilePhoto photo={person.photo} /></View>
    <View style={{ padding: 11 * s, gap: 3 * s }}><View style={{ flexDirection: `row`, alignItems: `center`, justifyContent: `space-between` }}><Txt size={15 * s} weight={`semibold`} color={colors.text}>{person.name}, {person.age}</Txt><Icon name={`arrow-up-right`} size={14 * s} color={colors.accentText} /></View><Txt size={7.3 * s} color={colors.muted}>{person.city}, NY · A little common ground</Txt><View style={{ marginTop: 4 * s, flexDirection: `row`, gap: 4 * s }}>{person.interests.slice(0, 2).map(label => <View key={label} style={{ paddingHorizontal: 7 * s, paddingVertical: 3 * s, backgroundColor: colors.pale, borderRadius: 12 * s }}><Txt size={7 * s} color={colors.accentText}>{label}</Txt></View>)}</View></View>
  </View>
</View>;

const MessagesPreview = ({ s, person }: { s: number; person: PreviewPerson }) => <View style={{ flex: 1, paddingHorizontal: 14 * s, gap: 12 * s }}>
  <View><Txt size={20 * s} weight={`bold`} color={colors.text} style={{ letterSpacing: -.7 * s }}>Good things start here.</Txt><Txt size={7.5 * s} color={colors.muted}>A little connection. A lot of possibility.</Txt></View>
  <View style={{ padding: 11 * s, borderWidth: .8 * s, borderColor: colors.border, borderRadius: 15 * s, flexDirection: `row`, alignItems: `center`, gap: 9 * s, backgroundColor: colors.surface }}>
    <View style={{ width: 36 * s, height: 36 * s, borderRadius: 20 * s, overflow: `hidden` }}><ProfilePhoto photo={person.photo} /></View>
    <View style={{ flex: 1 }}><Txt size={12 * s} color={colors.text} weight={`semibold`}>{person.name}</Txt><Txt size={7 * s} color={colors.muted}>Your Connection</Txt></View><Icon name={`heart`} size={14 * s} color={colors.accent} />
  </View>
  <Txt size={6.8 * s} color={colors.muted} style={{ textAlign: `center` }}>TODAY · A NEW HELLO</Txt>
  <View style={{ gap: 11 * s, flex: 1 }}>
    <View style={{ padding: 12 * s, borderRadius: 14 * s, borderBottomLeftRadius: 4 * s, backgroundColor: colors.surface, borderWidth: .8 * s, borderColor: colors.border, maxWidth: `88%` }}><Txt size={9 * s} color={colors.text}>{person.messages?.[0] ?? `What has made you smile this week?`}</Txt></View>
    <View style={{ alignSelf: `flex-end`, padding: 12 * s, borderRadius: 14 * s, borderBottomRightRadius: 4 * s, backgroundColor: colors.accent, maxWidth: `88%` }}><Txt size={9 * s} color={colors.onAccent}>{person.messages?.[1] ?? `A little sunshine and a very good playlist.`}</Txt></View>
    <View style={{ padding: 12 * s, borderRadius: 14 * s, borderBottomLeftRadius: 4 * s, backgroundColor: colors.surface, borderWidth: .8 * s, borderColor: colors.border, maxWidth: `88%` }}><Txt size={9 * s} color={colors.text}>{person.messages?.[2] ?? `That sounds like the start of a good day.`}</Txt></View>
  </View>
  <View style={{ paddingHorizontal: 11 * s, paddingVertical: 8 * s, borderRadius: 17 * s, backgroundColor: colors.surface, borderWidth: .8 * s, borderColor: colors.border, flexDirection: `row`, alignItems: `center`, justifyContent: `space-between` }}><Txt size={8 * s} color={colors.muted}>Say a little hello…</Txt><View style={{ backgroundColor: colors.accent, padding: 6 * s, borderRadius: 15 * s }}><Icon name={`arrow-up`} size={12 * s} color={colors.onAccent} /></View></View>
</View>;

export const PhonePreview = ({ screen, model, width = 260, person = 0 }: PhonePreviewProps) => {
  const s = width / 260;
  const device = devices[model];
  const radius = 41 * s;
  const selectedPerson = previewPeople[person] ?? previewPeople[0];
  return <View accessible accessibilityRole={`image`} accessibilityLabel={`MatchXD ${screen === `mxo` ? `MXO` : screen}`} style={{ width, height: width * 2.08, borderRadius: radius, boxShadow: `0 ${24 * s}px ${50 * s}px rgba(31,38,46,.18), 0 ${3 * s}px ${8 * s}px rgba(31,38,46,.12)` }}>
    <View importantForAccessibility={`no-hide-descendants`} accessibilityElementsHidden style={{ pointerEvents: `none`, flex: 1 }}>
      <View style={{ position: `absolute`, left: -2.2 * s, top: 96 * s, width: 3 * s, height: 17 * s, backgroundColor: device.edge, borderRadius: 2 * s }} />
      <View style={{ position: `absolute`, left: -2.2 * s, top: 133 * s, width: 3 * s, height: 34 * s, backgroundColor: device.edge, borderRadius: 2 * s }} />
      <View style={{ position: `absolute`, left: -2.2 * s, top: 179 * s, width: 3 * s, height: 34 * s, backgroundColor: device.edge, borderRadius: 2 * s }} />
      <View style={{ position: `absolute`, right: -2.2 * s, top: 143 * s, width: 3 * s, height: 49 * s, backgroundColor: device.edge, borderRadius: 2 * s }} />
      <LinearGradient colors={[device.highlight, device.rim, device.edge, device.rim, device.highlight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 2.3 * s, borderRadius: radius, borderWidth: .6 * s, borderColor: device.edge }}>
        <View style={{ flex: 1, padding: 4.4 * s, borderRadius: radius - 2 * s, backgroundColor: `#141519` }}>
          <View style={{ flex: 1, overflow: `hidden`, borderRadius: radius - 6.4 * s, backgroundColor: colors.bg }}>
            <StatusBar s={s} /><AppHeader s={s} />
            {screen === `discover` ? <DiscoverPreview s={s} person={selectedPerson} /> : screen === `mxo` ? <MxoPreview s={s} person={selectedPerson} /> : <MessagesPreview s={s} person={selectedPerson} />}
            <BottomNav s={s} screen={screen} />
            <View style={{ position: `absolute`, top: 7 * s, left: `50%`, marginLeft: -35 * s, width: 70 * s, height: 20 * s, borderRadius: 15 * s, backgroundColor: `#111216`, flexDirection: `row`, justifyContent: `flex-end`, alignItems: `center`, paddingRight: 7 * s }}><View style={{ width: 6 * s, height: 6 * s, borderRadius: 5 * s, backgroundColor: `#171C29`, borderWidth: s, borderColor: `#222A3A` }} /></View>
          </View>
        </View>
      </LinearGradient>
    </View>
  </View>;
};
