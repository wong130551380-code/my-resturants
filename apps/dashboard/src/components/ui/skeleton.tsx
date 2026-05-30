import { useEffect, useMemo } from 'react';
import { View, Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  style,
  variant = 'text',
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const variantDefaults: Record<string, { h: number; br: number; w: number | string }> = {
    text: { h: 16, br: Radius.xs, w: '100%' },
    circular: { h: 40, br: 9999, w: 40 },
    rectangular: { h: 100, br: Radius.md, w: '100%' },
  };

  const defaults = variantDefaults[variant];

  return (
    <Animated.View
      style={[
        {
          width: (width ?? defaults.w) as any,
          height: height ?? defaults.h,
          borderRadius: borderRadius ?? defaults.br,
          backgroundColor: colors.skeleton,
          opacity,
        } as any,
        style,
      ]}
    />
  );
}

// ─── Skeleton Line Group ─────────────────────────────────────────────────────

interface SkeletonLinesProps {
  lines?: number;
  gap?: number;
  lastLineWidth?: string | number;
}

export function SkeletonLines({ lines = 3, gap = Spacing.two, lastLineWidth = '60%' }: SkeletonLinesProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

export function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.four,
        gap: Spacing.three,
      }}
    >
      <View style={{ flexDirection: 'row', gap: Spacing.three, alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} />
        <View style={{ flex: 1, gap: Spacing.one }}>
          <Skeleton height={14} width="50%" />
          <Skeleton height={12} width="30%" />
        </View>
      </View>
      <SkeletonLines lines={2} />
    </View>
  );
}
