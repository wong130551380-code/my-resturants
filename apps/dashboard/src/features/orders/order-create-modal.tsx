import { useMemo, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Divider } from '@/components/ui/common';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/components/ui/toast';
import { Spacing, Radius } from '@/constants/theme';
import { getApiCustomers } from '@/api/generated/customers/customers';
import { getApiMenuItems } from '@/api/generated/menu/menu';
import { postApiOrders } from '@/api/generated/orders/orders';
import type { Customer, MenuItem, PostApiOrdersBodyType } from '@/api/generated/restaurantDashboardAPI.schemas';
import { canSubmitOrderDraft, getOrderDraftTotal, type OrderDraftItem } from './order-form';

type OrderCreateModalProps = {
  visible: boolean;
  onClose: () => void;
};

const orderTypeOptions: { label: string; value: PostApiOrdersBodyType }[] = [
  { label: 'Dine-in', value: 'dine-in' },
  { label: 'Takeout', value: 'takeout' },
  { label: 'Delivery', value: 'delivery' },
];

export function OrderCreateModal({ visible, onClose }: OrderCreateModalProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('walk-in');
  const [customerName, setCustomerName] = useState('Walk-in');
  const [type, setType] = useState<PostApiOrdersBodyType>('dine-in');
  const [tableNumber, setTableNumber] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [items, setItems] = useState<OrderDraftItem[]>([]);

  const customersQuery = useQuery({
    queryKey: ['customers', 'order-create'],
    queryFn: () => getApiCustomers(),
    enabled: visible,
  });

  const menuItemsQuery = useQuery({
    queryKey: ['menu-items', 'available'],
    queryFn: () => getApiMenuItems({ available: 'true' }),
    enabled: visible,
  });

  const customers = useMemo(() => (customersQuery.data ?? []) as Customer[], [customersQuery.data]);
  const menuItems = useMemo(() => (menuItemsQuery.data ?? []) as MenuItem[], [menuItemsQuery.data]);
  const selectedCustomer = customers.find((customer) => customer.id === customerId);

  const customerOptions = useMemo(
    () => [
      { label: 'Walk-in / New customer', value: 'walk-in' },
      ...customers.map((customer) => ({ label: customer.name, value: customer.id })),
    ],
    [customers],
  );

  const menuItemOptions = useMemo(
    () => [
      { label: 'Choose item', value: '' },
      ...menuItems.map((item) => ({ label: `${item.name} - $${parseFloat(item.price).toFixed(2)}`, value: item.id })),
    ],
    [menuItems],
  );

  const resolvedCustomerName = selectedCustomer?.name ?? customerName;
  const parsedTableNumber = type === 'dine-in' ? parseInt(tableNumber, 10) || 0 : 0;
  const total = getOrderDraftTotal(items);
  const canSubmit = canSubmitOrderDraft({
    customerName: resolvedCustomerName,
    type,
    tableNumber: parsedTableNumber,
    items,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      postApiOrders({
        customerId: selectedCustomer?.id,
        customerName: resolvedCustomerName,
        tableNumber: parsedTableNumber,
        type,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['popular-items'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Order created', 'success');
      resetAndClose();
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const resetAndClose = () => {
    setCustomerId('walk-in');
    setCustomerName('Walk-in');
    setType('dine-in');
    setTableNumber('1');
    setNotes('');
    setSelectedMenuItemId('');
    setQuantity('1');
    setItems([]);
    onClose();
  };

  const addSelectedItem = () => {
    const menuItem = menuItems.find((item) => item.id === selectedMenuItemId);
    const nextQuantity = parseInt(quantity, 10) || 1;
    if (!menuItem) return;

    setItems((current) => {
      const existing = current.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return current.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + nextQuantity }
            : item,
        );
      }
      return [
        ...current,
        {
          menuItemId: menuItem.id,
          quantity: nextQuantity,
          unitPrice: parseFloat(menuItem.price),
        },
      ];
    });
    setSelectedMenuItemId('');
    setQuantity('1');
  };

  const removeItem = (menuItemId: string) => {
    setItems((current) => current.filter((item) => item.menuItemId !== menuItemId));
  };

  const getItemName = (menuItemId: string) => menuItems.find((item) => item.id === menuItemId)?.name ?? 'Menu item';

  return (
    <Modal
      visible={visible}
      onClose={resetAndClose}
      title="New Order"
      subtitle="Create an order with server-verified totals"
      width={640}
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText type="headingMedium" style={{ color: colors.primary }}>
            ${total.toFixed(2)}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Button title="Cancel" variant="outline" onPress={resetAndClose} />
            <Button
              title="Create Order"
              variant="primary"
              disabled={!canSubmit}
              loading={createMutation.isPending}
              onPress={() => createMutation.mutate()}
            />
          </View>
        </View>
      }
    >
      <View style={{ gap: Spacing.four }}>
        {(customersQuery.isLoading || menuItemsQuery.isLoading) ? (
          <View style={{ paddingVertical: Spacing.six, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <View style={{ flex: 1 }}>
                <Select
                  label="Customer"
                  options={customerOptions}
                  value={customerId}
                  onChange={(value) => {
                    setCustomerId(value);
                    const customer = customers.find((item) => item.id === value);
                    if (customer) setCustomerName(customer.name);
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Select
                  label="Order Type"
                  options={orderTypeOptions}
                  value={type}
                  onChange={(value) => setType(value as PostApiOrdersBodyType)}
                />
              </View>
            </View>

            {customerId === 'walk-in' && (
              <Input
                label="Customer Name"
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Walk-in"
              />
            )}

            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Table Number"
                  value={tableNumber}
                  onChangeText={setTableNumber}
                  editable={type === 'dine-in'}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 2 }}>
                <Input
                  label="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Optional kitchen notes"
                />
              </View>
            </View>

            <Divider />

            <View style={{ gap: Spacing.two }}>
              <ThemedText type="headingSmall">Items</ThemedText>
              <View style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <Select
                    label="Menu Item"
                    options={menuItemOptions}
                    value={selectedMenuItemId}
                    onChange={setSelectedMenuItemId}
                  />
                </View>
                <View style={{ width: 80 }}>
                  <Input
                    label="Qty"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                  />
                </View>
                <Button title="Add" variant="secondary" onPress={addSelectedItem} disabled={!selectedMenuItemId} />
              </View>

              <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
                {items.length === 0 ? (
                  <ThemedText type="bodySmall" style={{ color: colors.textTertiary }}>
                    Add at least one available menu item.
                  </ThemedText>
                ) : (
                  items.map((item) => (
                    <View
                      key={item.menuItemId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: colors.borderSubtle,
                        borderRadius: Radius.md,
                        padding: Spacing.two,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 }}>
                        <Badge label={`${item.quantity}x`} variant="default" />
                        <ThemedText type="bodyMedium" style={{ flex: 1 }}>
                          {getItemName(item.menuItemId)}
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                        <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </ThemedText>
                        <Pressable onPress={() => removeItem(item.menuItemId)} style={{ padding: Spacing.one }}>
                          <ThemedText type="bodySmall" style={{ color: colors.errorText }}>
                            Remove
                          </ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
