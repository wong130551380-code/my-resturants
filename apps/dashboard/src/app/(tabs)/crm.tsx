import { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { EmptyState, PageHeader, Avatar, StatCard, Divider } from '@/components/ui/common';
import { useToast } from '@/components/ui/toast';
import { Spacing, MaxContentWidth, Radius } from '@/constants/theme';
import { useCustomers, useCustomerOrders, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/features/customers/use-customers';
import type { Customer } from '@/api/generated/restaurantDashboardAPI.schemas';

const tagOptions = ['VIP', 'Regular', 'New', 'Takeout', 'Delivery', 'Wine Lover', 'Corporate'];

function normalizeTags(tags: Customer['tags']) {
  return tags.filter((tag): tag is string => Boolean(tag));
}

export default function CRMScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<EditingCustomerState> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const apiFilters = tagFilter !== 'all' || search
    ? { ...(tagFilter !== 'all' ? { tag: tagFilter } : {}), ...(search ? { search } : {}) }
    : undefined;

  const customersQuery = useCustomers(apiFilters);
  const customers = customersQuery.data ?? [];

  const orderHistoryQuery = useCustomerOrders(selectedCustomer?.id ?? null);
  const orderHistory = orderHistoryQuery.data;

  const totalSpent = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent), 0);
  const avgSpent = customers.length > 0 ? totalSpent / customers.length : 0;
  const vipCount = customers.filter((c) => c.tags.includes('VIP')).length;

  const tagFilterOptions = [
    { label: 'All Tags', value: 'all' },
    ...tagOptions.map((t) => ({ label: t, value: t })),
  ];

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const openNew = useCallback(() => {
    setEditingCustomer({ name: '', email: '', phone: '', tags: [], notes: '' });
    setIsNew(true);
    setEditModal(true);
  }, []);

  const openDetail = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
  }, []);

  const openEdit = useCallback((customer?: Customer) => {
    const c = customer ?? selectedCustomer;
    if (!c) return;
    setEditingCustomer({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      tags: normalizeTags(c.tags),
      notes: c.notes ?? '',
    });
    setIsNew(false);
    setEditModal(true);
  }, [selectedCustomer]);

  const handleSave = useCallback(() => {
    if (!editingCustomer?.name) return;
    if (isNew) {
      createMutation.mutate(
        {
          name: editingCustomer.name,
          email: editingCustomer.email ?? '',
          phone: editingCustomer.phone ?? '',
          tags: editingCustomer.tags ?? [],
          notes: editingCustomer.notes || undefined,
        },
        {
          onSuccess: () => showToast('Customer added successfully', 'success'),
          onError: (err: Error) => showToast(err.message, 'error'),
        },
      );
    } else if (editingCustomer.id) {
      updateMutation.mutate(
        {
          id: editingCustomer.id,
          data: {
            name: editingCustomer.name,
            email: editingCustomer.email,
            phone: editingCustomer.phone,
            tags: editingCustomer.tags,
            notes: editingCustomer.notes || null,
          },
        },
        {
          onSuccess: () => {
            showToast('Customer updated successfully', 'success');
            // Update the selected customer data if open
            if (selectedCustomer?.id === editingCustomer.id) {
              setSelectedCustomer((prev) => prev ? { ...prev, ...editingCustomer } as Customer : null);
            }
          },
          onError: (err: Error) => showToast(err.message, 'error'),
        },
      );
    }
    setEditModal(false);
    setEditingCustomer(null);
  }, [editingCustomer, isNew, createMutation, updateMutation, selectedCustomer, showToast]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        showToast('Customer removed', 'info');
        setSelectedCustomer(null);
      },
      onError: (err: Error) => showToast(err.message, 'error'),
    });
    setEditModal(false);
    setEditingCustomer(null);
  }, [deleteMutation, showToast]);

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
            title="CRM"
            subtitle="Manage your customers and relationships"
            actions={
              <Button title="Add Customer" variant="primary" onPress={openNew} />
            }
          />

          {/* Stats */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginBottom: Spacing.six }}>
            <StatCard label="Total Customers" value={String(customers.length)} change={`${vipCount} VIP members`} changeType="positive" />
            <StatCard label="Total Revenue" value={`$${totalSpent.toFixed(0)}`} change="From all visits" changeType="neutral" />
            <StatCard label="Avg. Spend" value={`$${avgSpent.toFixed(0)}`} change="Per customer" changeType="neutral" />
          </View>

          {/* Filters */}
          <Card style={{ marginBottom: Spacing.four }}>
            <View style={{ flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 200 }}>
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChangeText={setSearch}
                  size="sm"
                />
              </View>
              <View style={{ width: 160 }}>
                <Select
                  options={tagFilterOptions}
                  value={tagFilter}
                  onChange={setTagFilter}
                  placeholder="Filter by tag"
                />
              </View>
            </View>
          </Card>

          {/* Customer Table */}
          <Card padding="zero">
            {customersQuery.isLoading ? (
              <View style={{ padding: Spacing.six, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : customers.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No customers found"
                description="Try adjusting your search or add a new customer."
                action={<Button title="Add Customer" variant="primary" onPress={openNew} />}
              />
            ) : (
              <DataTable
                data={customers}
                keyExtractor={(item) => item.id}
                onRowPress={openDetail}
                columns={[
                  {
                    key: 'name',
                    title: 'Customer',
                    render: (item: Customer) => (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                        <Avatar name={item.name} size={32} />
                        <View>
                          <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                            {item.name}
                          </ThemedText>
                          <ThemedText type="caption" style={{ color: colors.textTertiary }}>
                            {item.email}
                          </ThemedText>
                        </View>
                      </View>
                    ),
                  },
                  {
                    key: 'phone',
                    title: 'Phone',
                    width: 130,
                    render: (item: Customer) => (
                      <ThemedText type="bodySmall" style={{ color: colors.textSecondary }}>
                        {item.phone}
                      </ThemedText>
                    ),
                  },
                  {
                    key: 'totalVisits',
                    title: 'Visits',
                    width: 70,
                    align: 'center' as const,
                    render: (item: Customer) => (
                      <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                        {item.totalVisits}
                      </ThemedText>
                    ),
                  },
                  {
                    key: 'totalSpent',
                    title: 'Total Spent',
                    width: 100,
                    align: 'right' as const,
                    render: (item: Customer) => (
                      <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                        ${parseFloat(item.totalSpent).toFixed(0)}
                      </ThemedText>
                    ),
                  },
                  {
                    key: 'tags',
                    title: 'Tags',
                    width: 180,
                    render: (item: Customer) => (
                      <View style={{ flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' }}>
                        {normalizeTags(item.tags).map((tag) => (
                          <Badge
                            key={tag}
                            label={tag}
                            variant={tag === 'VIP' ? 'primary' : tag === 'New' ? 'info' : 'default'}
                            size="sm"
                          />
                        ))}
                      </View>
                    ),
                  },
                  {
                    key: 'lastVisit',
                    title: 'Last Visit',
                    width: 100,
                    align: 'right' as const,
                    render: (item: Customer) => (
                      <ThemedText type="caption" style={{ color: colors.textTertiary }}>
                        {item.lastVisit ? new Date(item.lastVisit).toLocaleDateString() : '-'}
                      </ThemedText>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>

      {/* Customer Detail Modal with Order History */}
      <Modal
        visible={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name ?? ''}
        subtitle={selectedCustomer ? `${selectedCustomer.email} - ${selectedCustomer.phone}` : ''}
        width={600}
        footer={
          selectedCustomer ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                title="Delete"
                variant="danger"
                size="sm"
                onPress={() => handleDelete(selectedCustomer.id)}
              />
              <Button title="Edit Customer" variant="primary" onPress={() => openEdit(selectedCustomer)} />
            </View>
          ) : undefined
        }
      >
        {selectedCustomer && (
          <View style={{ gap: Spacing.four }}>
            {/* Customer Info */}
            <View style={{ flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' }}>
              <StatCard label="Total Visits" value={String(selectedCustomer.totalVisits)} change="All time" changeType="neutral" />
              <StatCard label="Total Spent" value={`$${parseFloat(selectedCustomer.totalSpent).toFixed(0)}`} change="All time" changeType="neutral" />
              <StatCard label="Last Visit" value={selectedCustomer.lastVisit ? new Date(selectedCustomer.lastVisit).toLocaleDateString() : 'Never'} change="" changeType="neutral" />
            </View>

            {normalizeTags(selectedCustomer.tags).length > 0 && (
              <View style={{ flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' }}>
                {normalizeTags(selectedCustomer.tags).map((tag) => (
                  <Badge key={tag} label={tag} variant={tag === 'VIP' ? 'primary' : 'default'} />
                ))}
              </View>
            )}

            {selectedCustomer.notes && (
              <View style={{ backgroundColor: colors.backgroundSecondary, padding: Spacing.three, borderRadius: 8 }}>
                <ThemedText type="caption" style={{ color: colors.textSecondary }}>{selectedCustomer.notes}</ThemedText>
              </View>
            )}

            <Divider />

            {/* Order History */}
            <View>
              <ThemedText type="headingSmall" style={{ marginBottom: Spacing.two }}>
                Order History
                {orderHistory ? ` (${(orderHistory as any).orderCount ?? 0})` : ''}
              </ThemedText>

              {orderHistoryQuery.isLoading ? (
                <View style={{ padding: Spacing.four, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : !orderHistory || (orderHistory as any).orders?.length === 0 ? (
                <ThemedText type="bodySmall" style={{ color: colors.textTertiary, fontStyle: 'italic' }}>
                  No orders found for this customer.
                </ThemedText>
              ) : (
                <View style={{ gap: Spacing.two }}>
                  {((orderHistory as any).orders ?? []).map((order: any) => (
                    <View
                      key={order.id}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: Spacing.two,
                        paddingHorizontal: Spacing.three,
                        borderRadius: 8,
                        backgroundColor: colors.backgroundSecondary,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                          <ThemedText type="bodySmall" style={{ fontWeight: '600', color: colors.primary }}>
                            {order.orderNumber}
                          </ThemedText>
                          <Badge label={order.status} variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'} size="sm" />
                        </View>
                        <ThemedText type="caption" style={{ color: colors.textTertiary, marginTop: 2 }}>
                          {new Date(order.createdAt).toLocaleString()} - {order.type}
                        </ThemedText>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                          ${parseFloat(order.total).toFixed(2)}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: colors.textTertiary }}>
                          {order.itemCount} item{Number(order.itemCount) !== 1 ? 's' : ''}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Customer Edit Modal */}
      <Modal
        visible={editModal}
        onClose={() => { setEditModal(false); setEditingCustomer(null); }}
        title={isNew ? 'Add Customer' : 'Edit Customer'}
        width={520}
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              {!isNew && editingCustomer?.id && (
                <Button title="Delete" variant="danger" size="sm" onPress={() => handleDelete(editingCustomer.id!)} />
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <Button title="Cancel" variant="outline" onPress={() => { setEditModal(false); setEditingCustomer(null); }} />
              <Button title={isNew ? 'Add Customer' : 'Save Changes'} variant="primary" onPress={handleSave} />
            </View>
          </View>
        }
      >
        {editingCustomer && (
          <View style={{ gap: Spacing.four }}>
            <Input
              label="Full Name"
              value={editingCustomer.name}
              onChangeText={(text) => setEditingCustomer({ ...editingCustomer, name: text })}
              placeholder="Customer name"
            />
            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Email"
                  value={editingCustomer.email ?? ''}
                  onChangeText={(text) => setEditingCustomer({ ...editingCustomer, email: text })}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Phone"
                  value={editingCustomer.phone ?? ''}
                  onChangeText={(text) => setEditingCustomer({ ...editingCustomer, phone: text })}
                  placeholder="(555) 000-0000"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View>
              <ThemedText type="headingSmall" style={{ color: colors.textSecondary, marginBottom: Spacing.two }}>
                Tags
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
                {tagOptions.map((tag) => {
                  const isActive = editingCustomer.tags?.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => {
                        const currentTags = editingCustomer.tags || [];
                        setEditingCustomer({
                          ...editingCustomer,
                          tags: isActive
                            ? currentTags.filter((t) => t !== tag)
                            : [...currentTags, tag],
                        });
                      }}
                      style={{
                        paddingHorizontal: Spacing.three,
                        paddingVertical: Spacing.one,
                        borderRadius: Radius.full,
                        borderWidth: 1,
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive ? colors.primarySubtle : 'transparent',
                      }}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: isActive ? colors.primary : colors.textSecondary }}
                      >
                        {tag}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Input
              label="Notes"
              value={editingCustomer.notes || ''}
              onChangeText={(text) => setEditingCustomer({ ...editingCustomer, notes: text })}
              placeholder="Special preferences, allergies, etc."
            />
          </View>
        )}
      </Modal>
    </ThemedView>
  );
}

type EditingCustomerState = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  notes: string;
};
