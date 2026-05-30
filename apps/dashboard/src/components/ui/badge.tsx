import { View, type StyleProp, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = 'default', size = 'sm', dot = false, style }: BadgeProps) {
  const { colors } = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: colors.backgroundSecondary, text: colors.textSecondary },
    success: { bg: colors.successSubtle, text: colors.successText },
    warning: { bg: colors.warningSubtle, text: colors.warningText },
    error: { bg: colors.errorSubtle, text: colors.errorText },
    info: { bg: colors.infoSubtle, text: colors.infoText },
    primary: { bg: colors.primarySubtle, text: colors.primary },
  };

  const vs = variantStyles[variant];

  const sizeStyles: Record<BadgeSize, ViewStyle> = {
    sm: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, minHeight: 22 },
    md: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, minHeight: 26 },
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: Radius.full,
          backgroundColor: vs.bg,
          alignSelf: 'flex-start',
          gap: Spacing.one,
        },
        sizeStyles[size],
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: vs.text,
          }}
        />
      )}
      <ThemedText
        style={{
          fontSize: size === 'sm' ? 11 : 12,
          fontWeight: '600',
          color: vs.text,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

// ─── Status Dot ──────────────────────────────────────────────────────────────

interface StatusDotProps {
  variant?: BadgeVariant;
  size?: number;
}

export function StatusDot({ variant = 'default', size = 8 }: StatusDotProps) {
  const { colors } = useTheme();

  const colorMap: Record<BadgeVariant, string> = {
    default: colors.textSecondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    primary: colors.primary,
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorMap[variant],
      }}
    />
  );
}
