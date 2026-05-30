import { useEffect, useMemo } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function AnimatedIcon() {
  const { colors } = useTheme();
  const scale = useMemo(() => new Animated.Value(1), []);
  const rotate = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, [rotate]);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }, { scale }] }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.Text style={{ fontSize: 40 }}>🍽</Animated.Text>
      </View>
    </Animated.View>
  );
}

export function AnimatedSplashOverlay() {
  return null;
}
