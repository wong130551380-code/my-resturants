import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Animated, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Elevation } from '@/constants/theme';

// ─── Toast Types ─────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ─── Toast Provider ──────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        style={{
          position: 'absolute',
          bottom: Spacing.six,
          right: Spacing.six,
          zIndex: 9999,
          gap: Spacing.two,
          maxWidth: 400,
        }}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Toast Item ──────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { colors } = useTheme();
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateX = useMemo(() => new Animated.Value(50), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, damping: 15, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        onDismiss();
      });
    }, toast.duration ?? 4000);

    return () => clearTimeout(timer);
  }, [opacity, translateX, toast.duration, onDismiss]);

  const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
    success: { bg: colors.successSubtle, border: colors.success, icon: '✓' },
    error: { bg: colors.errorSubtle, border: colors.error, icon: '✕' },
    warning: { bg: colors.warningSubtle, border: colors.warning, icon: '!' },
    info: { bg: colors.infoSubtle, border: colors.info, icon: 'i' },
  };

  const vs = variantStyles[toast.variant];

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX }],
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.three,
        borderRadius: Radius.md,
        backgroundColor: vs.bg,
        borderLeftWidth: 3,
        borderLeftColor: vs.border,
        gap: Spacing.two,
        ...Elevation.md,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: vs.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ThemedText style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
          {vs.icon}
        </ThemedText>
      </View>
      <ThemedText type="bodySmall" style={{ flex: 1, color: colors.textPrimary }}>
        {toast.message}
      </ThemedText>
      <Pressable onPress={onDismiss} style={{ padding: Spacing.one }}>
        <ThemedText type="bodySmall" style={{ color: colors.textTertiary }}>
          ✕
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}
