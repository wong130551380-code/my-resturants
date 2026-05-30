import { useState, useRef } from 'react';
import {
  View,
  Pressable,
  FlatList,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Elevation } from '@/constants/theme';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled,
  containerStyle,
}: SelectProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef<View>(null);

  const selected = options.find((o) => o.value === value);

  const borderColor = error
    ? colors.error
    : open
      ? colors.inputFocus
      : hovered
        ? colors.borderStrong
        : colors.inputBorder;

  return (
    <View style={[{ gap: Spacing.one, position: 'relative', zIndex: open ? 100 : 0 }, containerStyle]}>
      {label && (
        <ThemedText type="headingSmall" style={{ color: colors.textSecondary }}>
          {label}
        </ThemedText>
      )}
      <View ref={buttonRef}>
        <Pressable
          onPress={() => !disabled && setOpen(!open)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.input,
            borderWidth: 1,
            borderColor,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.three,
            paddingVertical: Spacing.twoHalf,
            minHeight: 40,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <ThemedText
            type="bodyMedium"
            style={{ color: selected ? colors.textPrimary : colors.textTertiary }}
          >
            {selected ? selected.label : placeholder}
          </ThemedText>
          <ThemedText type="bodyMedium" style={{ color: colors.textTertiary }}>
            {open ? '▲' : '▼'}
          </ThemedText>
        </Pressable>
      </View>

      {open && (
        <>
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
            onPress={() => setOpen(false)}
          />
          <View
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: Spacing.one,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: Radius.md,
              ...Elevation.lg,
              zIndex: 100,
              maxHeight: 240,
              overflow: 'hidden',
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <SelectItem
                  label={item.label}
                  isSelected={item.value === value}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                />
              )}
            />
          </View>
        </>
      )}
      {error && (
        <ThemedText type="caption" style={{ color: colors.errorText }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

function SelectItem({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.twoHalf,
        backgroundColor: isSelected
          ? colors.primarySubtle
          : hovered
            ? colors.surfaceHover
            : 'transparent',
      }}
    >
      <ThemedText
        type="bodyMedium"
        style={{
          color: isSelected ? colors.primary : colors.textPrimary,
          fontWeight: isSelected ? '600' : '400',
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
