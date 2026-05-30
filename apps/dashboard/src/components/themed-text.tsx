import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Typography } from '@/constants/theme';

type TextType =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headingLarge'
  | 'headingMedium'
  | 'headingSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'code'
  // Legacy aliases
  | 'title'
  | 'subtitle'
  | 'default'
  | 'small'
  | 'link';

interface ThemedTextProps extends RNTextProps {
  style?: StyleProp<TextStyle>;
  type?: TextType;
  color?: string;
}

export function ThemedText({ style, type = 'bodyMedium', color, ...props }: ThemedTextProps) {
  const { colors } = useTheme();

  const typeMap: Record<string, TextStyle> = {
    displayLarge: Typography.displayLarge,
    displayMedium: Typography.displayMedium,
    displaySmall: Typography.displaySmall,
    headingLarge: Typography.headingLarge,
    headingMedium: Typography.headingMedium,
    headingSmall: Typography.headingSmall,
    bodyLarge: Typography.bodyLarge,
    bodyMedium: Typography.bodyMedium,
    bodySmall: Typography.bodySmall,
    caption: Typography.caption,
    overline: Typography.overline,
    code: Typography.code,
    // Legacy aliases
    title: Typography.displaySmall,
    subtitle: Typography.headingMedium,
    default: Typography.bodyMedium,
    small: Typography.bodySmall,
    link: { ...Typography.bodyMedium, color: colors.textLink },
  };

  const resolvedColor = color ?? (type === 'link' ? colors.textLink : colors.textPrimary);

  return (
    <RNText
      style={[
        typeMap[type] ?? Typography.bodyMedium,
        { color: resolvedColor },
        style,
      ]}
      {...props}
    />
  );
}
