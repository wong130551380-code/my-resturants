import { View, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';

// ─── Page Header ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: Spacing.four,
        gap: Spacing.four,
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText type="displaySmall" style={{ color: colors.textPrimary }}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            type="bodyMedium"
            style={{ color: colors.textSecondary, marginTop: Spacing.one }}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
      {actions && (
        <View style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'center' }}>
          {actions}
        </View>
      )}
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export function Divider({ style }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.divider },
        style,
      ]}
    />
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

interface TabsProps {
  tabs: { key: string; label: string; count?: number }[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: Spacing.one, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              paddingHorizontal: Spacing.four,
              paddingVertical: Spacing.three,
              borderBottomWidth: 2,
              borderBottomColor: isActive ? colors.primary : 'transparent',
              marginBottom: -1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.one,
            }}
          >
            <ThemedText
              type="headingSmall"
              style={{ color: isActive ? colors.primary : colors.textSecondary }}
            >
              {tab.label}
            </ThemedText>
            {tab.count !== undefined && (
              <View
                style={{
                  backgroundColor: isActive ? colors.primarySubtle : colors.backgroundSecondary,
                  paddingHorizontal: Spacing.two,
                  paddingVertical: 1,
                  borderRadius: Radius.full,
                }}
              >
                <ThemedText
                  type="caption"
                  style={{ color: isActive ? colors.primary : colors.textTertiary, fontSize: 11 }}
                >
                  {tab.count}
                </ThemedText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sixteen,
        paddingHorizontal: Spacing.eight,
        gap: Spacing.three,
      }}
    >
      <ThemedText style={{ fontSize: 48 }}>{icon}</ThemedText>
      <ThemedText type="headingMedium" style={{ color: colors.textPrimary }}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText
          type="bodyMedium"
          style={{ color: colors.textSecondary, textAlign: 'center', maxWidth: 360 }}
        >
          {description}
        </ThemedText>
      )}
      {action && <View style={{ marginTop: Spacing.two }}>{action}</View>}
    </View>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, change, changeType = 'neutral', icon }: StatCardProps) {
  const { colors } = useTheme();

  const changeColor =
    changeType === 'positive'
      ? colors.successText
      : changeType === 'negative'
        ? colors.errorText
        : colors.textTertiary;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.four,
        gap: Spacing.two,
        flex: 1,
        minWidth: 180,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText type="bodySmall" style={{ color: colors.textSecondary }}>
          {label}
        </ThemedText>
        {icon}
      </View>
      <ThemedText type="displayMedium" style={{ color: colors.textPrimary }}>
        {value}
      </ThemedText>
      {change && (
        <ThemedText type="caption" style={{ color: changeColor }}>
          {change}
        </ThemedText>
      )}
    </View>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 36, color }: AvatarProps) {
  const { colors: themeColors } = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = color ?? themeColors.primary;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ThemedText
        style={{
          color: '#FFFFFF',
          fontSize: size * 0.4,
          fontWeight: '600',
        }}
      >
        {initials}
      </ThemedText>
    </View>
  );
}
