import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: `MatchXD`,
  slug: `matchxd`,
  version: `0.1.0`,
  scheme: `matchxd`,
  owner: `strawhat19`,
  orientation: `portrait`,
  userInterfaceStyle: `automatic`,
  icon: `./assets/brand/icon.png`,
  ios: { supportsTablet: true, bundleIdentifier: `com.matchxd.app` },
  extra: { eas: { projectId: `b06e5192-7c43-448a-83c3-2a819dce899e` } },
  web: { bundler: `metro`, output: `single`, favicon: `./assets/brand/favicon.png`, name: `Match XD | Love the Cost of Love` },
  android: {
    package: `com.matchxd.app`,
    adaptiveIcon: { backgroundColor: `#FF5267`, foregroundImage: `./assets/brand/adaptive-icon.png` },
  },
  plugins: [
    `expo-font`,
    `expo-router`,
    `expo-image`,
    [`expo-splash-screen`, { image: `./assets/brand/icon.png`, imageWidth: 100, backgroundColor: `#17191F` }],
    [`expo-audio`, { microphonePermission: false }],
    [`expo-video`, { supportsBackgroundPlayback: false, supportsPictureInPicture: false }],
    [`expo-image-picker`, { microphonePermission: false, cameraPermission: `Allow MatchXD To Take Your Profile Photo`, photosPermission: `Allow MatchXD To Choose Your Profile Photos` }],
  ],
};

export default config;
