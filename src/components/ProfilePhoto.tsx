import { Image } from 'expo-image';
import type { Profile } from '../domain/types';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { avatarOptions, defaultProfileAvatar } from '../domain/avatars';
import { View, type StyleProp, type ViewStyle, type ImageStyle } from 'react-native';

export const photos: Record<string, number> = {
  sofia: require('../../assets/profiles/sofia.png'),
  maya: require('../../assets/profiles/maya.png'),
  elena: require('../../assets/profiles/elena.png'),
  marcus: require('../../assets/profiles/marcus.png'),
  ethan: require('../../assets/profiles/ethan.png'),
  noah: require('../../assets/profiles/noah.png'),
  zoe: require('../../assets/profiles/carousel/zoe.png'),
  nina: require('../../assets/profiles/carousel/nina.png'),
  theo: require('../../assets/profiles/carousel/theo.png'),
  aisha: require('../../assets/profiles/carousel/aisha.png'),
  priya: require('../../assets/profiles/carousel/priya.png'),
  lucia: require('../../assets/profiles/carousel/lucia.png'),
  amara: require('../../assets/profiles/carousel/amara.png'),
  isabel: require('../../assets/profiles/carousel/isabel.png'),
  julian: require('../../assets/profiles/carousel/julian.png'),
  oliver: require('../../assets/profiles/carousel/oliver.png'),
  gabriel: require('../../assets/profiles/carousel/gabriel.png'),
};

export const ProfilePhoto = ({ photo = defaultProfileAvatar, style }: { photo?: string; style?: StyleProp<ImageStyle> | StyleProp<ViewStyle> }) => {
  const avatar = avatarOptions.find(option => option.id === photo);
  if (!avatar) return <Image accessibilityLabel={`Profile Photo`} source={photos[photo] ?? { uri: photo }} contentFit={`cover`} transition={150} style={[{ width: `100%`, height: `100%` }, style as StyleProp<ImageStyle>]} />;
  const glasses = avatar.id === `avatar:violet` || avatar.id === `avatar:ocean`;
  const wink = avatar.id === `avatar:sunshine` || avatar.id === `avatar:rose`;
  return <View accessible accessibilityRole={`image`} accessibilityLabel={`${avatar.label} Avatar`} style={[{ width: `100%`, height: `100%`, overflow: `hidden`, backgroundColor: avatar.background }, style as StyleProp<ViewStyle>]}>
    <Svg width={`100%`} height={`100%`} viewBox={`0 0 160 160`} preserveAspectRatio={`xMidYMid slice`}>
      <Rect width={160} height={160} fill={avatar.background} />
      <Circle cx={143} cy={24} r={38} fill={avatar.face} opacity={0.5} />
      <Circle cx={18} cy={141} r={31} fill={avatar.face} opacity={0.55} />
      <Path d={`M28 165C29 125 47 111 80 111S131 125 132 165Z`} fill={avatar.accent} />
      <Ellipse cx={80} cy={77} rx={43} ry={48} fill={avatar.face} />
      <Path d={`M72 105Q80 116 88 105`} fill={`none`} stroke={avatar.accent} strokeWidth={4} strokeLinecap={`round`} />
      <Circle cx={64} cy={75} r={4} fill={avatar.accent} />
      {wink ? <Path d={`M91 76Q97 70 103 76`} fill={`none`} stroke={avatar.accent} strokeWidth={4} strokeLinecap={`round`} /> : <Circle cx={96} cy={75} r={4} fill={avatar.accent} />}
      {glasses && <><Circle cx={63} cy={76} r={13} fill={`none`} stroke={avatar.accent} strokeWidth={3} /><Circle cx={97} cy={76} r={13} fill={`none`} stroke={avatar.accent} strokeWidth={3} /><Path d={`M76 74Q80 71 84 74`} fill={`none`} stroke={avatar.accent} strokeWidth={3} /></>}
      {!glasses && <><Ellipse cx={51} cy={90} rx={7} ry={4} fill={avatar.accent} opacity={0.2} /><Ellipse cx={109} cy={90} rx={7} ry={4} fill={avatar.accent} opacity={0.2} /></>}
      <Path d={avatar.id === `avatar:mint` ? `M44 50Q41 26 63 28Q78 12 95 31Q119 27 117 53Q96 33 84 44Q64 35 44 50Z` : `M48 46Q49 25 70 30Q83 17 101 32Q117 34 113 51Q91 34 75 42Q61 35 48 46Z`} fill={avatar.accent} />
      <Path d={`M24 54V66M18 60H30M133 99V109M128 104H138`} stroke={avatar.accent} strokeWidth={2.5} strokeLinecap={`round`} opacity={0.4} />
    </Svg>
  </View>;
};

export const Avatar = ({ profile, size = 42 }: { profile: Profile; size?: number }) => <View style={{ width: size, height: size, borderRadius: size / 2, overflow: `hidden` }}><ProfilePhoto photo={profile.photos?.[0]} /></View>;
