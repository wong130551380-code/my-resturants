import { useEffect, useMemo } from 'react';
import {
  Modal as RNModal,
  View,
  Pressable,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Elevation } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  showClose?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 520,
  showClose = true,
}: ModalProps) {
  const { colors } = useTheme();
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.95), []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 20, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const maxWidth = Math.min(width, Dimensions.get('window').width - Spacing.eight);

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.four,
          }}
          onPress={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              width: maxWidth,
              maxHeight: '90%',
              backgroundColor: colors.surfaceElevated,
              borderRadius: Radius.xl,
              ...Elevation.xl,
            }}
          >
            {(title || showClose) && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: Spacing.six,
                  paddingBottom: Spacing.three,
                }}
              >
                <View style={{ flex: 1 }}>
                  {title && (
                    <ThemedText type="headingLarge">{title}</ThemedText>
                  )}
                  {subtitle && (
                    <ThemedText
                      type="bodySmall"
                      style={{ color: colors.textSecondary, marginTop: Spacing.one }}
                    >
                      {subtitle}
                    </ThemedText>
                  )}
                </View>
                {showClose && (
                  <Pressable
                    onPress={onClose}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: Radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: Spacing.two,
                    }}
                  >
                    <ThemedText type="headingMedium" style={{ color: colors.textTertiary }}>
                      ✕
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            )}
            <View style={{ paddingHorizontal: Spacing.six, paddingBottom: Spacing.four }}>
              {children}
            </View>
            {footer && (
              <View
                style={{
                  padding: Spacing.four,
                  paddingHorizontal: Spacing.six,
                  borderTopWidth: 1,
                  borderTopColor: colors.divider,
                }}
              >
                {footer}
              </View>
            )}
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      width={420}
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.three }}>
          <Button title={cancelLabel} variant="outline" onPress={onClose} />
          <Button
            title={confirmLabel}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
          />
        </View>
      }
    >
      <ThemedText type="bodyMedium" style={{ marginTop: Spacing.two }}>
        {message}
      </ThemedText>
    </Modal>
  );
}
