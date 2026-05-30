import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export function WebBadge() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentSubtle,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.one,
        borderRadius: Radius.full,
        gap: Spacing.one,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} />
      <ThemedText type="caption" style={{ color: colors.accent }}>
        Web Ready
      </ThemedText>
    </View>
  );
}
