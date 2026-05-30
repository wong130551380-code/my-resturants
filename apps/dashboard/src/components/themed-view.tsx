import { View, type ViewStyle, type StyleProp, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ThemedViewProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  type?: 'background' | 'backgroundElement' | 'surface' | 'elevated' | 'transparent';
}

export function ThemedView({ style, type = 'background', ...props }: ThemedViewProps) {
  const { colors } = useTheme();

  const bgMap: Record<string, string> = {
    background: colors.background,
    backgroundElement: colors.backgroundSecondary,
    surface: colors.surface,
    elevated: colors.surfaceElevated,
    transparent: 'transparent',
  };

  return (
    <View
      style={[{ backgroundColor: bgMap[type] }, style]}
      {...props}
    />
  );
}
