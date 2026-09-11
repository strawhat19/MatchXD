import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: `MatchXD`,
  slug: `matchxd`,
  scheme: `matchxd`,
  version: `0.1.0`,
  orientation: `portrait`,
  userInterfaceStyle: `automatic`,
  icon: `./assets/brand/icon.png`,
  ios: { supportsTablet: true, bundleIdentifier: `com.matchxd.app` },
  web: { bundler: `metro`, output: `single`, favicon: `./assets/brand/icon.png` },
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
    [`expo-image-picker`, { cameraPermission: false, microphonePermission: false, photosPermission: `Choose photos for your MatchXD demo profile` }],
  ],
};

export default config;
