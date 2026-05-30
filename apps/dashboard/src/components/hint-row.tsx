import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface HintRowProps {
  title: string;
  hint: React.ReactNode;
}

export function HintRow({ title, hint }: HintRowProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.one,
      }}
    >
      <ThemedText type="bodyMedium" style={{ color: colors.textSecondary }}>
        {title}
      </ThemedText>
      <View>{typeof hint === 'string' ? <ThemedText type="bodySmall">{hint}</ThemedText> : hint}</View>
    </View>
  );
}
