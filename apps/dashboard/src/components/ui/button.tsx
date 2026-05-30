import { forwardRef, useState } from 'react';
import {
  Pressable,
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<any, ButtonProps>(function Button(
  {
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    style,
    ...props
  },
  ref
) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.oneHalf,
      minHeight: 32,
      gap: Spacing.one,
    },
    md: {
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.twoHalf,
      minHeight: 40,
      gap: Spacing.two,
    },
    lg: {
      paddingHorizontal: Spacing.six,
      paddingVertical: Spacing.three,
      minHeight: 48,
      gap: Spacing.two,
    },
  };

  const textSizes: Record<ButtonSize, TextStyle> = {
    sm: { fontSize: 13, lineHeight: 18 },
    md: { fontSize: 15, lineHeight: 20 },
    lg: { fontSize: 17, lineHeight: 22 },
  };

  function getVariantStyles(): ViewStyle & { textColor: string } {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed
            ? colors.primaryActive
            : hovered
              ? colors.primaryHover
              : colors.primary,
          textColor: colors.textInverse,
        };
      case 'secondary':
        return {
          backgroundColor: pressed
            ? colors.surfaceActive
            : hovered
              ? colors.surfaceHover
              : colors.backgroundSecondary,
          textColor: colors.textPrimary,
        };
      case 'outline':
        return {
          backgroundColor: pressed ? colors.surfaceActive : 'transparent',
          borderWidth: 1,
          borderColor: hovered ? colors.borderStrong : colors.border,
          textColor: colors.textPrimary,
        };
      case 'ghost':
        return {
          backgroundColor: pressed
            ? colors.surfaceActive
            : hovered
              ? colors.surfaceHover
              : 'transparent',
          textColor: colors.textPrimary,
        };
      case 'danger':
        return {
          backgroundColor: pressed
            ? colors.errorText
            : hovered
              ? colors.error
              : colors.error,
          textColor: '#FFFFFF',
        };
    }
  }

  const variantStyles = getVariantStyles();
  const { textColor, ...bgStyles } = variantStyles;

  const disabledStyle: ViewStyle = isDisabled
    ? { opacity: 0.5 }
    : {};

  return (
    <Pressable
      ref={ref}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      disabled={isDisabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: Radius.md,
        },
        sizeStyles[size],
        bgStyles,
        disabledStyle,
        fullWidth && { width: '100%' },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {leftIcon}
          <ThemedText
            type="headingSmall"
            style={[textSizes[size], { color: textColor }]}
          >
            {title}
          </ThemedText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
});
