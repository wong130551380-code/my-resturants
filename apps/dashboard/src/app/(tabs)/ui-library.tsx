import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input, TextArea, Checkbox, Toggle } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge, StatusDot } from '@/components/ui/badge';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Skeleton, SkeletonLines, SkeletonCard } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ListItem } from '@/components/ui/table';
import { Divider, Avatar, PageHeader, Tabs, EmptyState, StatCard } from '@/components/ui/common';
import { Spacing, MaxContentWidth, Radius } from '@/constants/theme';

export default function UILibraryScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('tokens');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('');
  const [checkVal, setCheckVal] = useState(false);
  const [toggleVal, setToggleVal] = useState(false);

  const tabs = [
    { key: 'tokens', label: 'Tokens' },
    { key: 'typography', label: 'Typography' },
    { key: 'spacing', label: 'Spacing' },
    { key: 'surfaces', label: 'Surfaces' },
    { key: 'components', label: 'Components' },
    { key: 'states', label: 'States' },
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            maxWidth: MaxContentWidth,
            width: '100%',
            alignSelf: 'center',
            paddingHorizontal: Spacing.four,
            paddingBottom: Spacing.twenty,
          }}
        >
          <PageHeader title="UI Library" subtitle="Design system reference and component showcase" />

          <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

          <View style={{ marginTop: Spacing.six, gap: Spacing.six }}>
            {/* ─── Tokens ──────────────────────────────────────────────── */}
            {activeTab === 'tokens' && (
              <>
                <Card>
                  <CardHeader title="Color Tokens" subtitle="Semantic color palette" />
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Brand</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.four }}>
                    <ColorSwatch label="Primary" color={colors.primary} />
                    <ColorSwatch label="Primary Hover" color={colors.primaryHover} />
                    <ColorSwatch label="Primary Subtle" color={colors.primarySubtle} />
                    <ColorSwatch label="Accent" color={colors.accent} />
                    <ColorSwatch label="Accent Subtle" color={colors.accentSubtle} />
                  </View>
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Backgrounds</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.four }}>
                    <ColorSwatch label="Background" color={colors.background} border />
                    <ColorSwatch label="Bg Secondary" color={colors.backgroundSecondary} border />
                    <ColorSwatch label="Surface" color={colors.surface} border />
                    <ColorSwatch label="Surface Hover" color={colors.surfaceHover} border />
                    <ColorSwatch label="Surface Active" color={colors.surfaceActive} border />
                  </View>
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Text</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.four }}>
                    <ColorSwatch label="Text Primary" color={colors.textPrimary} />
                    <ColorSwatch label="Text Secondary" color={colors.textSecondary} />
                    <ColorSwatch label="Text Tertiary" color={colors.textTertiary} />
                    <ColorSwatch label="Text Disabled" color={colors.textDisabled} />
                    <ColorSwatch label="Text Inverse" color={colors.textInverse} />
                  </View>
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Semantic</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
                    <ColorSwatch label="Success" color={colors.success} />
                    <ColorSwatch label="Warning" color={colors.warning} />
                    <ColorSwatch label="Error" color={colors.error} />
                    <ColorSwatch label="Info" color={colors.info} />
                  </View>
                </Card>

                <Card>
                  <CardHeader title="Radius Tokens" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four, alignItems: 'flex-end' }}>
                    {[
                      { label: 'xs (4)', value: Radius.xs },
                      { label: 'sm (6)', value: Radius.sm },
                      { label: 'md (8)', value: Radius.md },
                      { label: 'lg (12)', value: Radius.lg },
                      { label: 'xl (16)', value: Radius.xl },
                      { label: 'xxl (20)', value: Radius.xxl },
                      { label: 'full', value: Radius.full },
                    ].map((r) => (
                      <View key={r.label} style={{ alignItems: 'center', gap: Spacing.one }}>
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: Math.min(r.value, 24),
                            backgroundColor: colors.primary,
                          }}
                        />
                        <ThemedText type="caption" style={{ color: colors.textSecondary }}>
                          {r.label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* ─── Typography ──────────────────────────────────────────── */}
            {activeTab === 'typography' && (
              <Card>
                <CardHeader title="Typography Scale" subtitle="All text styles in the design system" />
                <View style={{ gap: Spacing.four }}>
                  {[
                    { name: 'Display Large', type: 'displayLarge' as const, desc: '34px / 700 / -0.5 tracking' },
                    { name: 'Display Medium', type: 'displayMedium' as const, desc: '28px / 700 / -0.3 tracking' },
                    { name: 'Display Small', type: 'displaySmall' as const, desc: '22px / 600 / -0.2 tracking' },
                    { name: 'Heading Large', type: 'headingLarge' as const, desc: '20px / 600' },
                    { name: 'Heading Medium', type: 'headingMedium' as const, desc: '17px / 600' },
                    { name: 'Heading Small', type: 'headingSmall' as const, desc: '15px / 600' },
                    { name: 'Body Large', type: 'bodyLarge' as const, desc: '17px / 400' },
                    { name: 'Body Medium', type: 'bodyMedium' as const, desc: '15px / 400' },
                    { name: 'Body Small', type: 'bodySmall' as const, desc: '13px / 400' },
                    { name: 'Caption', type: 'caption' as const, desc: '12px / 400 / 0.2 tracking' },
                    { name: 'Overline', type: 'overline' as const, desc: '11px / 600 / uppercase' },
                    { name: 'Code', type: 'code' as const, desc: '13px / monospace' },
                  ].map((item) => (
                    <View key={item.name} style={{ gap: Spacing.one }}>
                      <ThemedText type={item.type}>
                        {item.name === 'Code' ? 'const x = 42;' : `The quick brown fox - ${item.name}`}
                      </ThemedText>
                      <ThemedText type="caption" style={{ color: colors.textTertiary }}>
                        {item.desc}
                      </ThemedText>
                      <Divider />
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* ─── Spacing ─────────────────────────────────────────────── */}
            {activeTab === 'spacing' && (
              <Card>
                <CardHeader title="Spacing Scale" subtitle="4px base spacing system" />
                <View style={{ gap: Spacing.two }}>
                  {[
                    { name: 'half', value: 2 },
                    { name: 'one', value: 4 },
                    { name: 'two', value: 8 },
                    { name: 'three', value: 12 },
                    { name: 'four', value: 16 },
                    { name: 'five', value: 20 },
                    { name: 'six', value: 24 },
                    { name: 'eight', value: 32 },
                    { name: 'ten', value: 40 },
                    { name: 'twelve', value: 48 },
                    { name: 'sixteen', value: 64 },
                  ].map((s) => (
                    <View key={s.name} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
                      <ThemedText type="caption" style={{ width: 60, color: colors.textSecondary }}>
                        {s.name}
                      </ThemedText>
                      <ThemedText type="caption" style={{ width: 40, color: colors.textTertiary }}>
                        {s.value}px
                      </ThemedText>
                      <View
                        style={{
                          width: s.value,
                          height: 20,
                          backgroundColor: colors.primary,
                          borderRadius: Radius.xs,
                        }}
                      />
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* ─── Surfaces ────────────────────────────────────────────── */}
            {activeTab === 'surfaces' && (
              <>
                <Card>
                  <CardHeader title="Card Variants" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four }}>
                    {(['default', 'outlined', 'elevated', 'filled'] as const).map((variant) => (
                      <View key={variant} style={{ flex: 1, minWidth: 200 }}>
                        <Card variant={variant}>
                          <ThemedText type="headingSmall">{variant}</ThemedText>
                          <ThemedText type="bodySmall" style={{ color: colors.textSecondary, marginTop: Spacing.one }}>
                            Card variant description
                          </ThemedText>
                        </Card>
                      </View>
                    ))}
                  </View>
                </Card>
              </>
            )}

            {/* ─── Components ──────────────────────────────────────────── */}
            {activeTab === 'components' && (
              <>
                {/* Buttons */}
                <Card>
                  <CardHeader title="Buttons" subtitle="All button variants and sizes" />
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Variants</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginBottom: Spacing.four }}>
                    <Button title="Primary" variant="primary" />
                    <Button title="Secondary" variant="secondary" />
                    <Button title="Outline" variant="outline" />
                    <Button title="Ghost" variant="ghost" />
                    <Button title="Danger" variant="danger" />
                  </View>
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Sizes</ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.four }}>
                    <Button title="Small" size="sm" variant="primary" />
                    <Button title="Medium" size="md" variant="primary" />
                    <Button title="Large" size="lg" variant="primary" />
                  </View>
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>States</ThemedText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three }}>
                    <Button title="Loading" variant="primary" loading />
                    <Button title="Disabled" variant="primary" disabled />
                    <Button title="Full Width" variant="primary" fullWidth />
                  </View>
                </Card>

                {/* Inputs */}
                <Card>
                  <CardHeader title="Inputs & Form Controls" />
                  <View style={{ gap: Spacing.four, maxWidth: 400 }}>
                    <Input label="Default Input" placeholder="Type something..." value={inputVal} onChangeText={setInputVal} />
                    <Input label="With Hint" placeholder="Email address" hint="We'll never share your email" />
                    <Input label="With Error" placeholder="Required field" error="This field is required" value="" onChangeText={() => {}} />
                    <Input label="Disabled" placeholder="Cannot edit" editable={false} />
                    <TextArea label="Text Area" placeholder="Write a longer message..." rows={3} />
                    <Select
                      label="Select"
                      options={[
                        { label: 'Option A', value: 'a' },
                        { label: 'Option B', value: 'b' },
                        { label: 'Option C', value: 'c' },
                      ]}
                      value={selectVal}
                      onChange={setSelectVal}
                      placeholder="Choose an option"
                    />
                    <Checkbox checked={checkVal} onChange={setCheckVal} label="I agree to the terms" />
                    <Toggle value={toggleVal} onChange={setToggleVal} label="Enable notifications" />
                  </View>
                </Card>

                {/* Badges */}
                <Card>
                  <CardHeader title="Badges & Status Indicators" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.four }}>
                    <Badge label="Default" variant="default" />
                    <Badge label="Primary" variant="primary" />
                    <Badge label="Success" variant="success" />
                    <Badge label="Warning" variant="warning" />
                    <Badge label="Error" variant="error" />
                    <Badge label="Info" variant="info" />
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.four }}>
                    <Badge label="With Dot" variant="success" dot />
                    <Badge label="Large" variant="primary" size="md" />
                  </View>
                  <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>Status Dots</ThemedText>
                  <View style={{ flexDirection: 'row', gap: Spacing.four }}>
                    {(['default', 'success', 'warning', 'error', 'info', 'primary'] as const).map((v) => (
                      <View key={v} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                        <StatusDot variant={v} />
                        <ThemedText type="caption" style={{ color: colors.textSecondary }}>{v}</ThemedText>
                      </View>
                    ))}
                  </View>
                </Card>

                {/* Modal Trigger */}
                <Card>
                  <CardHeader title="Modals & Dialogs" />
                  <View style={{ flexDirection: 'row', gap: Spacing.three }}>
                    <Button title="Open Modal" variant="primary" onPress={() => setModalVisible(true)} />
                    <Button title="Confirm Dialog" variant="outline" onPress={() => setConfirmVisible(true)} />
                  </View>
                </Card>

                {/* List Items */}
                <Card>
                  <CardHeader title="List Items" />
                  <ListItem
                    title="John Doe"
                    subtitle="john@example.com"
                    left={<Avatar name="John Doe" size={36} />}
                    right={<Badge label="VIP" variant="primary" />}
                  />
                  <ListItem
                    title="Jane Smith"
                    subtitle="jane@example.com"
                    left={<Avatar name="Jane Smith" size={36} />}
                    right={<Badge label="Regular" variant="default" />}
                  />
                  <ListItem
                    title="Bob Wilson"
                    subtitle="bob@example.com"
                    left={<Avatar name="Bob Wilson" size={36} />}
                    right={<Badge label="New" variant="info" />}
                  />
                </Card>
              </>
            )}

            {/* ─── States ──────────────────────────────────────────────── */}
            {activeTab === 'states' && (
              <>
                {/* Loading / Skeleton */}
                <Card>
                  <CardHeader title="Loading States" subtitle="Skeleton patterns for content loading" />
                  <View style={{ gap: Spacing.four }}>
                    <ThemedText type="headingSmall">Skeleton Card</ThemedText>
                    <View style={{ flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' }}>
                      <View style={{ flex: 1, minWidth: 240 }}><SkeletonCard /></View>
                      <View style={{ flex: 1, minWidth: 240 }}><SkeletonCard /></View>
                    </View>
                    <Divider />
                    <ThemedText type="headingSmall">Skeleton Lines</ThemedText>
                    <View style={{ maxWidth: 400, gap: Spacing.three }}>
                      <View style={{ flexDirection: 'row', gap: Spacing.three, alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <View style={{ flex: 1 }}>
                          <Skeleton height={14} width="60%" />
                          <View style={{ height: Spacing.one }} />
                          <Skeleton height={12} width="40%" />
                        </View>
                      </View>
                      <SkeletonLines lines={4} />
                    </View>
                  </View>
                </Card>

                {/* Empty States */}
                <Card>
                  <CardHeader title="Empty States" />
                  <EmptyState
                    icon="📋"
                    title="No orders yet"
                    description="When orders come in, they'll appear here."
                    action={<Button title="Create Order" variant="primary" />}
                  />
                </Card>

                {/* Feedback / Toast */}
                <Card>
                  <CardHeader title="Feedback / Toast Notifications" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
                    <Button title="Success Toast" variant="primary" onPress={() => showToast('Order saved!', 'success')} />
                    <Button title="Error Toast" variant="danger" onPress={() => showToast('Failed to save', 'error')} />
                    <Button title="Warning Toast" variant="secondary" onPress={() => showToast('Low stock alert', 'warning')} />
                    <Button title="Info Toast" variant="outline" onPress={() => showToast('New update available', 'info')} />
                  </View>
                </Card>

                {/* Avatars */}
                <Card>
                  <CardHeader title="Avatars" />
                  <View style={{ flexDirection: 'row', gap: Spacing.three, alignItems: 'center' }}>
                    <Avatar name="Alice Brown" size={48} />
                    <Avatar name="Bob Chen" size={40} />
                    <Avatar name="Carol Davis" size={36} />
                    <Avatar name="Dan Evans" size={32} />
                    <Avatar name="Eve Foster" size={28} />
                  </View>
                </Card>

                {/* Stat Cards */}
                <Card>
                  <CardHeader title="Stat Cards" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three }}>
                    <StatCard label="Revenue" value="$12,450" change="+15% from last week" changeType="positive" />
                    <StatCard label="Orders" value="142" change="-3 from yesterday" changeType="negative" />
                    <StatCard label="Avg. Ticket" value="$87.50" change="Stable" changeType="neutral" />
                  </View>
                </Card>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Demo Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Example Modal"
        subtitle="This is a modal dialog component"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two }}>
            <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
            <Button title="Confirm" variant="primary" onPress={() => { setModalVisible(false); showToast('Confirmed!', 'success'); }} />
          </View>
        }
      >
        <ThemedText type="bodyMedium">
          This modal demonstrates the overlay, animation, and content layout patterns.
          It supports title, subtitle, custom content, and footer actions.
        </ThemedText>
      </Modal>

      {/* Demo Confirm */}
      <ConfirmDialog
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => { setConfirmVisible(false); showToast('Action confirmed', 'success'); }}
        title="Confirm Action"
        message="Are you sure you want to proceed? This action cannot be undone."
        confirmLabel="Yes, proceed"
      />
    </ThemedView>
  );
}

// ─── Color Swatch Component ──────────────────────────────────────────────────

function ColorSwatch({ label, color, border }: { label: string; color: string; border?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: Spacing.one, width: 80 }}>
      <View
        style={{
          width: 64,
          height: 40,
          borderRadius: Radius.md,
          backgroundColor: color,
          borderWidth: border ? 1 : 0,
          borderColor: colors.border,
        }}
      />
      <ThemedText type="caption" style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 10 }}>
        {label}
      </ThemedText>
    </View>
  );
}
