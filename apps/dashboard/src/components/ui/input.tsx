import { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
    size = 'md',
    editable = true,
    ...props
  },
  ref
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const sizeMap = {
    sm: { paddingVertical: Spacing.oneHalf, paddingHorizontal: Spacing.two, minHeight: 32, fontSize: 13 },
    md: { paddingVertical: Spacing.twoHalf, paddingHorizontal: Spacing.three, minHeight: 40, fontSize: 15 },
    lg: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, minHeight: 48, fontSize: 17 },
  };

  const s = sizeMap[size];

  const borderColor = error
    ? colors.error
    : focused
      ? colors.inputFocus
      : colors.inputBorder;

  return (
    <View style={[{ gap: Spacing.one }, containerStyle]}>
      {label && (
        <ThemedText type="headingSmall" style={{ color: colors.textSecondary }}>
          {label}
        </ThemedText>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.input,
          borderWidth: 1,
          borderColor,
          borderRadius: Radius.md,
          paddingHorizontal: s.paddingHorizontal,
          minHeight: s.minHeight,
          gap: Spacing.two,
          opacity: editable ? 1 : 0.5,
        }}
      >
        {leftIcon && <View style={{ marginRight: Spacing.one }}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.textTertiary}
          style={[
            {
              flex: 1,
              color: colors.textPrimary,
              fontSize: s.fontSize,
              paddingVertical: 0,
              paddingHorizontal: 0,
              outlineStyle: 'none',
            } as any,
            Typography.bodyMedium,
            inputStyle,
          ]}
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: Spacing.one }}>{rightIcon}</View>}
      </View>
      {(error || hint) && (
        <ThemedText
          type="caption"
          style={{ color: error ? colors.errorText : colors.textTertiary }}
        >
          {error || hint}
        </ThemedText>
      )}
    </View>
  );
});

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextAreaProps extends InputProps {
  rows?: number;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(
  { rows = 4, inputStyle, ...props },
  ref
) {
  return (
    <Input
      ref={ref}
      multiline
      numberOfLines={rows}
      inputStyle={[{ minHeight: rows * 24, textAlignVertical: 'top' } as any, inputStyle]}
      {...props}
    />
  );
});

// ─── Checkbox ────────────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        opacity: disabled ? 0.5 : 1,
      } as any}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: Radius.xs,
          borderWidth: 2,
          borderColor: checked ? colors.primary : hovered ? colors.borderStrong : colors.border,
          backgroundColor: checked ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <ThemedText style={{ color: colors.textInverse, fontSize: 12, fontWeight: '700' }}>
            ✓
          </ThemedText>
        )}
      </View>
      {label && (
        <ThemedText type="bodyMedium" style={{ color: disabled ? colors.textDisabled : colors.textPrimary }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ value, onChange, label, disabled }: ToggleProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        opacity: disabled ? 0.5 : 1,
      } as any}
    >
      <View
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          backgroundColor: value ? colors.primary : colors.border,
          padding: 2,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
      {label && (
        <ThemedText type="bodyMedium" style={{ color: disabled ? colors.textDisabled : colors.textPrimary }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}
