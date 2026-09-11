import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../state/AppProvider';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Txt, Row } from '../components/ui';
import { Icon } from '../components/Icon';
import { AppIcon } from '../components/BrandMark';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

const Content = () => {
  const { colors, dark } = useTheme();
  const { ready, notice, dismissNotice, storageError } = useApp();
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(dismissNotice, 5000);
    return () => clearTimeout(timeout);
  }, [notice, dismissNotice]);
  return <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <StatusBar style={dark ? `light` : `dark`} />
    {!ready || (!fontsLoaded && !fontError) ? <View style={{ flex: 1, gap: 20, alignItems: `center`, justifyContent: `center` }}><AppIcon size={70} /><ActivityIndicator color={colors.accent} accessibilityLabel="Loading MatchXD" /></View> : <Slot />}
    {notice || storageError ? <View style={{ pointerEvents: `box-none`, position: `absolute`, top: Platform.OS === `web` ? 92 : 110, left: 20, right: 20, alignItems: `center`, zIndex: 100 }}><Pressable accessibilityRole="alert" accessibilityLabel={notice ?? storageError ?? ``} onPress={dismissNotice} style={{ maxWidth: 560, borderWidth: 1, padding: 16, borderRadius: 15, backgroundColor: colors.surface, borderColor: colors.accent }}><Row><Icon name="info" color={colors.accent} size={18} /><Txt style={{ flexShrink: 1 }}>{notice ?? storageError}</Txt><Icon name="x" size={15} color={colors.muted} /></Row></Pressable></View> : null}
  </View>;
};

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><AppProvider><ThemeProvider><Content /></ThemeProvider></AppProvider></SafeAreaProvider></GestureHandlerRootView>;
}
