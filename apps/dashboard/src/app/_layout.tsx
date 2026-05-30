import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider as CustomThemeProvider } from '@/hooks/use-theme';
import { ToastProvider } from '@/components/ui/toast';
import { QueryProvider } from '@/hooks/query-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CustomThemeProvider>
        <QueryProvider>
          <ToastProvider>
            <AnimatedSplashOverlay />
            <Slot />
          </ToastProvider>
        </QueryProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}
