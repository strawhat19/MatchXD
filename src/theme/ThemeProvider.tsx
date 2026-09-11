import { useColorScheme } from 'react-native';
import { palettes } from './tokens';
import { useApp } from '../state/AppProvider';
import { createContext, useContext, type ReactNode } from 'react';

const ThemeContext = createContext({ colors: palettes.dark, dark: true });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const scheme = useColorScheme();
  const { state } = useApp();
  const dark = state.settings.theme === `dark` || (state.settings.theme === `system` && scheme === `dark`);
  return <ThemeContext.Provider value={{ dark, colors: dark ? palettes.dark : palettes.light }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
