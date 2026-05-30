import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DataTable } from '@/components/ui/table';
import { Tabs, EmptyState, PageHeader, Divider } from '@/components/ui/common';
import { useToast } from '@/components/ui/toast';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { getApiOrders, getApiOrdersId, patchApiOrdersIdStatus } from '@/api/generated/orders/orders';
import type { OrderSummary, Order, OrderStatus, PatchApiOrdersIdStatusBodyStatus } from '@/api/generated/restaurantDashboardAPI.schemas';
import { OrderCreateModal } from '@/features/orders/order-create-modal';

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Served', value: 'served' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const typeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Dine-in', value: 'dine-in' },
  { label: 'Takeout', value: 'takeout' },
  { label: 'Delivery', value: 'delivery' },
];

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Build API query params
  const apiParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [statusFilter, typeFilter]);

  const ordersQuery = useQuery({
    queryKey: ['orders', apiParams],
    queryFn: () => getApiOrders(apiParams),
    refetchInterval: 10000,
  });

  const allOrders = useMemo(() => (ordersQuery.data ?? []) as OrderSummary[], [ordersQuery.data]);

  // Client-side filtering for tabs and search
  const filtered = useMemo(() => {
    let result = allOrders;
    if (activeTab === 'active') result = result.filter((o) => ['pending', 'preparing', 'ready', 'served'].includes(o.status));
    if (activeTab === 'completed') result = result.filter((o) => o.status === 'completed');
    if (activeTab === 'cancelled') result = result.filter((o) => o.status === 'cancelled');
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allOrders, search, activeTab]);

  const tabs = [
    { key: 'all', label: 'All', count: allOrders.length },
    { key: 'active', label: 'Active', count: allOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length },
    { key: 'completed', label: 'Completed', count: allOrders.filter((o) => o.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', count: allOrders.filter((o) => o.status === 'cancelled').length },
  ];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PatchApiOrdersIdStatusBodyStatus }) =>
      patchApiOrdersIdStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      showToast('Order status updated', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message, 'error');
    },
  });

  const handleStatusChange = useCallback((orderId: string, newStatus: PatchApiOrdersIdStatusBodyStatus) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatus });
    }
  }, [statusMutation, selectedOrder]);

  const handleRowPress = useCallback(async (order: OrderSummary) => {
    try {
      const detail = await getApiOrdersId(order.id) as any;
      setSelectedOrder(detail);
    } catch {
      showToast('Failed to load order details', 'error');
    }
  }, [showToast]);

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
            title="Orders"
            subtitle={`${allOrders.length} orders`}
            actions={
              <Button title="New Order" variant="primary" onPress={() => setCreateModalVisible(true)} />
            }
          />

          <Card style={{ marginBottom: Spacing.four }}>
            <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

            <View style={{ marginTop: Spacing.three, flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 200 }}>
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChangeText={setSearch}
                  size="sm"
                />
              </View>
              <View style={{ width: 160 }}>
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Status"
                />
              </View>
              <View style={{ width: 160 }}>
                <Select
                  options={typeOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="Type"
                />
              </View>
            </View>
          </Card>

          <Card padding="zero">
            {ordersQuery.isLoading ? (
              <View style={{ padding: Spacing.six, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No orders found"
                description="Try adjusting your filters or create a new order."
                action={<Button title="New Order" variant="primary" onPress={() => setCreateModalVisible(true)} />}
              />
            ) : (
              <DataTable
                data={filtered}
                keyExtractor={(item) => item.id}
                onRowPress={handleRowPress}
                columns={[
                  {
                    key: 'orderNumber',
                    title: 'Order',
                    width: 140,
                    render: (item: OrderSummary) => (
                      <ThemedText type="bodySmall" style={{ fontWeight: '600', color: colors.primary }}>
                        {item.orderNumber}
                      </ThemedText>
                    ),
                  },
                  {
                    key: 'customerName',
                    title: 'Customer',
                    render: (item: OrderSummary) => (
                      <View>
                        <ThemedText type="bodySmall" style={{ fontWeight: '500' }}>
                          {item.customerName}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: colors.textTertiary }}>
                          {item.type === 'dine-in' ? `Table ${item.tableNumber}` : item.type}
                        </ThemedText>
                      </View>
                    ),
                  },
                  {
                    key: 'itemCount',
                    title: 'Items',
                    render: (item: OrderSummary) => (
                      <ThemedText type="bodySmall" style={{ color: colors.textSecondary }}>
                        {typeof item.itemCount === 'number' ? item.itemCount : item.itemCount} item{Number(item.itemCount) > 1 ? 's' : ''}
                      </ThemedText>
                    ),
                  },
                  {
                    key: 'total',
                    title: 'Total',
                    width: 90,
                    align: 'right' as const,
                    render: (item: OrderSummary) => (
                      <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                        ${parseFloat(item.total).toFixed(2)}
                      </ThemedText>
                    ),
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    width: 110,
                    render: (item: OrderSummary) => <OrderBadge status={item.status} />,
                  },
                  {
                    key: 'createdAt',
                    title: 'Time',
                    width: 80,
                    align: 'right' as const,
                    render: (item: OrderSummary) => (
                      <ThemedText type="caption" style={{ color: colors.textTertiary }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </ThemedText>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>

      {/* Order Detail Modal */}
      <Modal
        visible={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ''}
        subtitle={selectedOrder ? `${selectedOrder.customerName} - ${selectedOrder.type === 'dine-in' ? `Table ${selectedOrder.tableNumber}` : selectedOrder.type}` : ''}
        width={560}
        footer={
          selectedOrder && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                title="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => handleStatusChange(selectedOrder.id, 'cancelled')}
              />
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                {selectedOrder.status === 'pending' && (
                  <Button title="Start Preparing" variant="primary" onPress={() => handleStatusChange(selectedOrder.id, 'preparing')} />
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button title="Mark Ready" variant="primary" onPress={() => handleStatusChange(selectedOrder.id, 'ready')} />
                )}
                {selectedOrder.status === 'ready' && (
                  <Button title="Mark Served" variant="primary" onPress={() => handleStatusChange(selectedOrder.id, 'served')} />
                )}
                {selectedOrder.status === 'served' && (
                  <Button title="Complete" variant="primary" onPress={() => handleStatusChange(selectedOrder.id, 'completed')} />
                )}
              </View>
            </View>
          ) : undefined
        }
      >
        {selectedOrder && (
          <View style={{ gap: Spacing.four }}>
            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <OrderBadge status={selectedOrder.status} />
              <Badge label={selectedOrder.type} variant="default" />
            </View>

            <Divider />

            <View style={{ gap: Spacing.two }}>
              <ThemedText type="headingSmall">Items</ThemedText>
              {selectedOrder.items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: Spacing.one,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: colors.backgroundSecondary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ThemedText type="caption" style={{ fontWeight: '600' }}>
                        {item.quantity}x
                      </ThemedText>
                    </View>
                    <ThemedText type="bodyMedium" style={{ flex: 1 }}>
                      {item.name}
                    </ThemedText>
                  </View>
                  <ThemedText type="bodyMedium" style={{ fontWeight: '600' }}>
                    ${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                  </ThemedText>
                </View>
              ))}
            </View>

            <Divider />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText type="headingMedium">Total</ThemedText>
              <ThemedText type="headingLarge" style={{ color: colors.primary }}>
                ${parseFloat(selectedOrder.total).toFixed(2)}
              </ThemedText>
            </View>

            {selectedOrder.notes && (
              <View style={{ backgroundColor: colors.warningSubtle, padding: Spacing.three, borderRadius: 8 }}>
                <ThemedText type="bodySmall" style={{ color: colors.warningText }}>
                  Note: {selectedOrder.notes}
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </Modal>
      <OrderCreateModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />
    </ThemedView>
  );
}

function OrderBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'default' | 'error'> = {
    pending: 'warning',
    preparing: 'info',
    ready: 'primary',
    served: 'success',
    completed: 'default',
    cancelled: 'error',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge label={label} variant={variantMap[status] ?? 'default'} dot />;
}
