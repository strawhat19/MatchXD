import { Image } from 'expo-image';
import { View, type StyleProp, type ViewStyle, type ImageStyle } from 'react-native';
import type { Profile } from '../domain/types';

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

export const ProfilePhoto = ({ photo, style }: { photo?: string; style?: StyleProp<ImageStyle> | StyleProp<ViewStyle> }) => <Image accessibilityLabel="Profile photo" source={photos[photo ?? `sofia`] ?? { uri: photo }} contentFit="cover" transition={150} style={[{ width: `100%`, height: `100%` }, style as StyleProp<ImageStyle>]} />;

export const Avatar = ({ profile, size = 42 }: { profile: Profile; size?: number }) => <View style={{ width: size, height: size, borderRadius: size / 2, overflow: `hidden` }}><ProfilePhoto photo={profile.photos?.[0]} /></View>;
