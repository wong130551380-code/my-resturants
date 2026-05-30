import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, type ThemeTokens, type ColorScheme } from '@/constants/theme';

const ThemeContext = createContext<ThemeTokens | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const raw = useColorScheme();
  const scheme: ColorScheme = raw === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeTokens {
  const theme = useContext(ThemeContext);
  if (!theme) {
    return getTheme('light');
  }
  return theme;
}

export function useColors() {
  return useTheme().colors;
}
