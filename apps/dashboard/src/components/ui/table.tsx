import { useState } from 'react';
import {
  View,
  Pressable,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// ─── Table Column ────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  title: string;
  width?: number | `${number}%`;
  align?: 'left' | 'center' | 'right';
  render: (item: T, index: number) => React.ReactNode;
}

// ─── DataTable ───────────────────────────────────────────────────────────────

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowPress?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowPress,
  emptyMessage = 'No data available',
  loading = false,
}: DataTableProps<T>) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ padding: Spacing.eight, alignItems: 'center' }}>
        <ThemedText type="bodyMedium" style={{ color: colors.textTertiary }}>
          Loading...
        </ThemedText>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={{ padding: Spacing.eight, alignItems: 'center', gap: Spacing.two }}>
        <ThemedText type="bodyLarge" style={{ color: colors.textTertiary }}>
          {emptyMessage}
        </ThemedText>
      </View>
    );
  }

  return (
    <View>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: Spacing.four,
          paddingVertical: Spacing.three,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        {columns.map((col) => (
          <View
            key={col.key}
            style={{
              width: col.width,
              flex: col.width ? 0 : 1,
              alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
            }}
          >
            <ThemedText
              type="overline"
              style={{ color: colors.textTertiary, fontSize: 11 }}
            >
              {col.title}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Rows */}
      {data.map((item, index) => (
        <TableRow
          key={keyExtractor(item)}
          item={item}
          index={index}
          columns={columns}
          onPress={onRowPress}
        />
      ))}
    </View>
  );
}

// ─── Table Row ───────────────────────────────────────────────────────────────

function TableRow<T>({
  item,
  index,
  columns,
  onPress,
}: {
  item: T;
  index: number;
  columns: Column<T>[];
  onPress?: (item: T) => void;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: 'row',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.three,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: hovered ? colors.surfaceHover : 'transparent',
      } as any}
    >
      {columns.map((col) => (
        <View
          key={col.key}
          style={{
            width: col.width,
            flex: col.width ? 0 : 1,
            alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
          }}
        >
          {col.render(item, index)}
        </View>
      ))}
    </Pressable>
  );
}

// ─── List Item ───────────────────────────────────────────────────────────────

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  border?: boolean;
}

export function ListItem({ title, subtitle, left, right, onPress, border = true }: ListItemProps) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.three,
        paddingHorizontal: Spacing.four,
        gap: Spacing.three,
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: colors.divider,
        backgroundColor: hovered && onPress ? colors.surfaceHover : 'transparent',
      } as any}
    >
      {left}
      <View style={{ flex: 1 }}>
        <ThemedText type="bodyMedium">{title}</ThemedText>
        {subtitle && (
          <ThemedText type="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {right}
    </Pressable>
  );
}
