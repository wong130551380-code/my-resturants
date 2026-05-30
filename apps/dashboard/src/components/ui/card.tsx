import { View, type StyleProp, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Elevation } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: keyof typeof Spacing;
}

export function Card({ children, style, variant = 'elevated', padding = 'four' }: CardProps) {
  const { colors } = useTheme();

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    elevated: {
      backgroundColor: colors.card,
      ...Elevation.sm,
    },
    filled: {
      backgroundColor: colors.backgroundSecondary,
    },
  };

  return (
    <View
      style={[
        {
          borderRadius: Radius.lg,
          padding: Spacing[padding],
        },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── Card Header ─────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.three,
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText type="headingMedium" style={{ color: colors.textPrimary }}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText type="bodySmall" style={{ color: colors.textSecondary, marginTop: Spacing.one }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {action && <View style={{ marginLeft: Spacing.three }}>{action}</View>}
    </View>
  );
}
