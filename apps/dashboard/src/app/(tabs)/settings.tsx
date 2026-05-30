import { useMemo, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input, Toggle } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader } from '@/components/ui/card';
import { Divider, PageHeader } from '@/components/ui/common';
import { useToast } from '@/components/ui/toast';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { getApiSettings, putApiSettings } from '@/api/generated/settings/settings';
import type { RestaurantSettings, PutApiSettingsBody } from '@/api/generated/restaurantDashboardAPI.schemas';

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (\u20AC)', value: 'EUR' },
  { label: 'GBP (\u00A3)', value: 'GBP' },
  { label: 'JPY (\u00A5)', value: 'JPY' },
];

const timezoneOptions = [
  { label: 'Eastern (ET)', value: 'America/New_York' },
  { label: 'Central (CT)', value: 'America/Chicago' },
  { label: 'Mountain (MT)', value: 'America/Denver' },
  { label: 'Pacific (PT)', value: 'America/Los_Angeles' },
  { label: 'UTC', value: 'UTC' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
];

function toSettingsForm(serverSettings?: RestaurantSettings): Record<string, any> {
  if (!serverSettings) return {};
  return {
    name: serverSettings.name,
    address: serverSettings.address,
    phone: serverSettings.phone,
    email: serverSettings.email,
    currency: serverSettings.currency,
    timezone: serverSettings.timezone,
    taxRate: parseFloat(serverSettings.taxRate),
    openTime: serverSettings.openTime,
    closeTime: serverSettings.closeTime,
    tables: serverSettings.tables,
    autoAcceptOrders: serverSettings.autoAcceptOrders,
    emailNotifications: serverSettings.emailNotifications,
    smsNotifications: serverSettings.smsNotifications,
    prepTimeMinutes: serverSettings.prepTimeMinutes,
  };
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => getApiSettings(),
  });

  const serverSettings = settingsQuery.data as RestaurantSettings | undefined;

  const serverForm = useMemo(() => toSettingsForm(serverSettings), [serverSettings]);
  const [draftSettings, setDraftSettings] = useState<Record<string, any> | null>(null);
  const settings = draftSettings ?? serverForm;
  const hasChanges = draftSettings !== null;

  const saveMutation = useMutation({
    mutationFn: (data: PutApiSettingsBody) => putApiSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setDraftSettings(null);
      showToast('Settings saved successfully', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const update = <K extends string>(key: K, value: any) => {
    setDraftSettings((prev) => ({ ...(prev ?? serverForm), [key]: value }));
  };

  const handleSave = () => {
    const payload: PutApiSettingsBody = {};
    for (const [key, val] of Object.entries(settings)) {
      if (val !== undefined && val !== null) {
        (payload as any)[key] = val;
      }
    }
    saveMutation.mutate(payload);
  };

  const handleReset = () => {
    if (serverSettings) {
      setDraftSettings(null);
      showToast('Settings reset to server values', 'info');
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

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
          <PageHeader
            title="Settings"
            subtitle="Configure your restaurant dashboard"
            actions={
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <Button
                  title="Reset"
                  variant="outline"
                  onPress={handleReset}
                  disabled={!hasChanges}
                />
                <Button
                  title="Save Changes"
                  variant="primary"
                  onPress={handleSave}
                  disabled={!hasChanges}
                  loading={saveMutation.isPending}
                />
              </View>
            }
          />

          <View style={{ gap: Spacing.four, maxWidth: 720 }}>
            {/* General */}
            <Card>
              <CardHeader title="General" subtitle="Basic restaurant information" />
              <View style={{ gap: Spacing.four }}>
                <Input
                  label="Restaurant Name"
                  value={settings.name ?? ''}
                  onChangeText={(text) => update('name', text)}
                />
                <Input
                  label="Address"
                  value={settings.address ?? ''}
                  onChangeText={(text) => update('address', text)}
                />
                <View style={{ flexDirection: 'row', gap: Spacing.three }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Phone"
                      value={settings.phone ?? ''}
                      onChangeText={(text) => update('phone', text)}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Email"
                      value={settings.email ?? ''}
                      onChangeText={(text) => update('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            </Card>

            {/* Regional */}
            <Card>
              <CardHeader title="Regional" subtitle="Currency, timezone, and tax settings" />
              <View style={{ gap: Spacing.four }}>
                <View style={{ flexDirection: 'row', gap: Spacing.three }}>
                  <View style={{ flex: 1 }}>
                    <Select
                      label="Currency"
                      options={currencyOptions}
                      value={settings.currency}
                      onChange={(val) => update('currency', val)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Select
                      label="Timezone"
                      options={timezoneOptions}
                      value={settings.timezone}
                      onChange={(val) => update('timezone', val)}
                    />
                  </View>
                </View>
                <Input
                  label="Tax Rate (%)"
                  value={String(settings.taxRate ?? '')}
                  onChangeText={(text) => update('taxRate', parseFloat(text) || 0)}
                  keyboardType="decimal-pad"
                />
              </View>
            </Card>

            {/* Operations */}
            <Card>
              <CardHeader title="Operations" subtitle="Operating hours and table management" />
              <View style={{ gap: Spacing.four }}>
                <View style={{ flexDirection: 'row', gap: Spacing.three }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Opening Time"
                      value={settings.openTime ?? ''}
                      onChangeText={(text) => update('openTime', text)}
                      placeholder="HH:MM"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Closing Time"
                      value={settings.closeTime ?? ''}
                      onChangeText={(text) => update('closeTime', text)}
                      placeholder="HH:MM"
                    />
                  </View>
                </View>
                <Input
                  label="Number of Tables"
                  value={String(settings.tables ?? '')}
                  onChangeText={(text) => update('tables', parseInt(text) || 0)}
                  keyboardType="number-pad"
                />
              </View>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader title="Notifications" subtitle="Configure alert preferences" />
              <View style={{ gap: Spacing.four }}>
                <Toggle
                  value={settings.autoAcceptOrders ?? false}
                  onChange={(val) => update('autoAcceptOrders', val)}
                  label="Auto-accept new orders"
                />
                <Divider />
                <Toggle
                  value={settings.emailNotifications ?? false}
                  onChange={(val) => update('emailNotifications', val)}
                  label="Email notifications for new orders"
                />
                <Divider />
                <Toggle
                  value={settings.smsNotifications ?? false}
                  onChange={(val) => update('smsNotifications', val)}
                  label="SMS notifications for urgent alerts"
                />
              </View>
            </Card>

            {/* Danger Zone */}
            <Card>
              <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
              <View style={{ gap: Spacing.three }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <ThemedText type="bodyMedium" style={{ fontWeight: '500' }}>
                      Reset all data
                    </ThemedText>
                    <ThemedText type="bodySmall" style={{ color: colors.textTertiary }}>
                      This will clear all orders, customers, and settings.
                    </ThemedText>
                  </View>
                  <Button title="Reset Data" variant="danger" size="sm" />
                </View>
                <Divider />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <ThemedText type="bodyMedium" style={{ fontWeight: '500' }}>
                      Delete restaurant
                    </ThemedText>
                    <ThemedText type="bodySmall" style={{ color: colors.textTertiary }}>
                      Permanently remove this restaurant and all associated data.
                    </ThemedText>
                  </View>
                  <Button title="Delete" variant="danger" size="sm" />
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
