import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input, Toggle } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState, PageHeader } from '@/components/ui/common';
import { useToast } from '@/components/ui/toast';
import { Spacing, MaxContentWidth, Radius } from '@/constants/theme';
import { getApiMenuCategories, getApiMenuItems, postApiMenuItems, putApiMenuItemsId, deleteApiMenuItemsId } from '@/api/generated/menu/menu';
import type { Category, MenuItem } from '@/api/generated/restaurantDashboardAPI.schemas';

export default function MenuScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<EditingItemState> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Fetch categories and items
  const categoriesQuery = useQuery({
    queryKey: ['menu-categories'],
    queryFn: () => getApiMenuCategories(),
  });

  const itemsQuery = useQuery({
    queryKey: ['menu-items', { categoryFilter, showAvailableOnly }],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      if (showAvailableOnly) params.available = 'true';
      return getApiMenuItems(Object.keys(params).length > 0 ? params : undefined);
    },
  });

  const categories = useMemo(() => (categoriesQuery.data ?? []) as Category[], [categoriesQuery.data]);
  const items = useMemo(() => (itemsQuery.data ?? []) as MenuItem[], [itemsQuery.data]);

  const categoryFilterOptions = useMemo(() => [
    { label: 'All Categories', value: 'all' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ], [categories]);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, search]);

  const grouped = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const groups: Record<string, MenuItem[]> = {};
    filtered.forEach((item) => {
      const catName = (item as any).category?.name ?? categoryMap.get(item.categoryId) ?? 'Uncategorized';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });
    return groups;
  }, [filtered, categories]);

  // Mutations
  const invalidateMenu = () => {
    queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    queryClient.invalidateQueries({ queryKey: ['popular-items'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof postApiMenuItems>[0]) => postApiMenuItems(data),
    onSuccess: () => { invalidateMenu(); showToast('Menu item created', 'success'); },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof putApiMenuItemsId>[1] }) => putApiMenuItemsId(id, data),
    onSuccess: () => { invalidateMenu(); showToast('Menu item updated', 'success'); },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApiMenuItemsId(id),
    onSuccess: () => { invalidateMenu(); showToast('Menu item deleted', 'success'); },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const openNew = useCallback(() => {
    setEditingItem({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id ?? '',
      available: true,
      popular: false,
    });
    setIsNew(true);
    setEditModal(true);
  }, [categories]);

  const openEdit = useCallback((item: MenuItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      categoryId: item.categoryId,
      available: item.available,
      popular: item.popular,
    });
    setIsNew(false);
    setEditModal(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!editingItem?.name) return;
    if (isNew) {
      createMutation.mutate({
        name: editingItem.name,
        description: editingItem.description ?? '',
        price: editingItem.price ?? 0,
        categoryId: editingItem.categoryId ?? categories[0]?.id ?? '',
        available: editingItem.available ?? true,
        popular: editingItem.popular ?? false,
      });
    } else if (editingItem.id) {
      updateMutation.mutate({
        id: editingItem.id,
        data: {
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          categoryId: editingItem.categoryId,
          available: editingItem.available,
          popular: editingItem.popular,
        },
      });
    }
    setEditModal(false);
    setEditingItem(null);
  }, [editingItem, isNew, createMutation, updateMutation, categories]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
    setEditModal(false);
    setEditingItem(null);
  }, [deleteMutation]);

  const toggleAvailability = useCallback((item: MenuItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { available: !item.available },
    });
  }, [updateMutation]);

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
            title="Menu"
            subtitle={`${items.length} items across ${categories.length} categories`}
            actions={
              <Button title="Add Item" variant="primary" onPress={openNew} />
            }
          />

          {/* Filters */}
          <Card style={{ marginBottom: Spacing.four }}>
            <View style={{ flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap', alignItems: 'center' }}>
              <View style={{ flex: 1, minWidth: 200 }}>
                <Input
                  placeholder="Search menu items..."
                  value={search}
                  onChangeText={setSearch}
                  size="sm"
                />
              </View>
              <View style={{ width: 180 }}>
                <Select
                  options={categoryFilterOptions}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="Category"
                />
              </View>
              <Toggle
                value={showAvailableOnly}
                onChange={setShowAvailableOnly}
                label="Available only"
              />
            </View>
          </Card>

          {/* Menu Grid */}
          {itemsQuery.isLoading ? (
            <View style={{ padding: Spacing.six, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : Object.keys(grouped).length === 0 ? (
            <Card>
              <EmptyState
                icon="🍽"
                title="No menu items found"
                description="Try adjusting your filters or add a new item."
                action={<Button title="Add Item" variant="primary" onPress={openNew} />}
              />
            </Card>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <View key={category} style={{ marginBottom: Spacing.six }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three }}>
                  <ThemedText type="headingMedium">{category}</ThemedText>
                  <Badge label={String(categoryItems.length)} variant="default" />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three }}>
                  {categoryItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onPress={() => openEdit(item)}
                      onToggle={() => toggleAvailability(item)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Edit/Create Modal */}
      <Modal
        visible={editModal}
        onClose={() => { setEditModal(false); setEditingItem(null); }}
        title={isNew ? 'Add Menu Item' : 'Edit Menu Item'}
        width={520}
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              {!isNew && editingItem?.id && (
                <Button
                  title="Delete"
                  variant="danger"
                  size="sm"
                  onPress={() => handleDelete(editingItem.id!)}
                />
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <Button title="Cancel" variant="outline" onPress={() => { setEditModal(false); setEditingItem(null); }} />
              <Button title={isNew ? 'Add Item' : 'Save Changes'} variant="primary" onPress={handleSave} />
            </View>
          </View>
        }
      >
        {editingItem && (
          <View style={{ gap: Spacing.four }}>
            <Input
              label="Name"
              value={editingItem.name}
              onChangeText={(text) => setEditingItem({ ...editingItem, name: text })}
              placeholder="Item name"
            />
            <Input
              label="Description"
              value={editingItem.description ?? ''}
              onChangeText={(text) => setEditingItem({ ...editingItem, description: text })}
              placeholder="Brief description"
            />
            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Price ($)"
                  value={String(editingItem.price ?? '')}
                  onChangeText={(text) => setEditingItem({ ...editingItem, price: parseFloat(text) || 0 })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Select
                  label="Category"
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  value={editingItem.categoryId}
                  onChange={(val) => setEditingItem({ ...editingItem, categoryId: val })}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.six }}>
              <Toggle
                value={editingItem.available ?? true}
                onChange={(val) => setEditingItem({ ...editingItem, available: val })}
                label="Available"
              />
              <Toggle
                value={editingItem.popular ?? false}
                onChange={(val) => setEditingItem({ ...editingItem, popular: val })}
                label="Popular"
              />
            </View>
          </View>
        )}
      </Modal>
    </ThemedView>
  );
}

type EditingItemState = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  popular: boolean;
};

function MenuCard({
  item,
  onPress,
  onToggle,
}: {
  item: MenuItem;
  onPress: () => void;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        width: 260,
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.four,
        gap: Spacing.two,
        borderWidth: 1,
        borderColor: hovered ? colors.borderStrong : colors.borderSubtle,
        opacity: item.available ? 1 : 0.6,
        cursor: 'pointer' as any,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <ThemedText type="headingSmall" numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText type="caption" style={{ color: colors.textTertiary, marginTop: 2 }} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText type="headingMedium" style={{ color: colors.primary }}>
          ${parseFloat(item.price).toFixed(2)}
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: Spacing.one }}>
          {item.popular && <Badge label="Popular" variant="primary" size="sm" />}
          <Badge
            label={item.available ? 'Available' : 'Unavailable'}
            variant={item.available ? 'success' : 'error'}
            size="sm"
          />
        </View>
      </View>
    </Pressable>
  );
}
