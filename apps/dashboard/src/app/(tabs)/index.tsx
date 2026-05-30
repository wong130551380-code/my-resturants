import { useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard, PageHeader, Divider } from '@/components/ui/common';
import { DataTable } from '@/components/ui/table';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { getApiDashboardStats, getApiDashboardRecentOrders, getApiDashboardPopularItems } from '@/api/generated/dashboard/dashboard';
import type { OrderSummary, PopularItem, DashboardStats } from '@/api/generated/restaurantDashboardAPI.schemas';

export default function HomeScreen() {
  const { colors } = useTheme();

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getApiDashboardStats(),
    refetchInterval: 30000,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => getApiDashboardRecentOrders({ limit: '5' }),
    refetchInterval: 15000,
  });

  const popularItemsQuery = useQuery({
    queryKey: ['popular-items'],
    queryFn: () => getApiDashboardPopularItems({ limit: '5' }),
  });

  const stats = statsQuery.data as DashboardStats | undefined;
  const recentOrders = (recentOrdersQuery.data ?? []) as OrderSummary[];
  const popularItems = (popularItemsQuery.data ?? []) as PopularItem[];

  const isLoading = statsQuery.isLoading;

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
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening today."
          />

          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.twenty }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText type="bodySmall" style={{ color: colors.textTertiary, marginTop: Spacing.two }}>
                Loading dashboard...
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Stats Row */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginBottom: Spacing.six }}>
                <StatCard
                  label="Today's Revenue"
                  value={`$${parseFloat(stats?.todayRevenue ?? '0').toFixed(0)}`}
                  change={`$${parseFloat(stats?.totalRevenue ?? '0').toFixed(0)} total`}
                  changeType="positive"
                />
                <StatCard
                  label="Active Orders"
                  value={String((stats?.pendingOrders ?? 0) + (stats?.preparingOrders ?? 0))}
                  change={`${stats?.todayOrders ?? 0} orders today`}
                  changeType="neutral"
                />
                <StatCard
                  label="Total Customers"
                  value={String(stats?.totalCustomers ?? 0)}
                  change="All time"
                  changeType="neutral"
                />
                <StatCard
                  label="Avg. Order Value"
                  value={`$${parseFloat(stats?.avgOrderValue ?? '0').toFixed(0)}`}
                  change="All time average"
                  changeType="positive"
                />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four }}>
                {/* Recent Orders */}
                <View style={{ flex: 2, minWidth: 320 }}>
                  <Card>
                    <CardHeader
                      title="Recent Orders"
                      subtitle="Latest orders from today"
                    />
                    {recentOrders.length === 0 ? (
                      <ThemedText type="bodySmall" style={{ color: colors.textTertiary, paddingVertical: Spacing.four }}>
                        No orders yet today.
                      </ThemedText>
                    ) : (
                      <DataTable
                        data={recentOrders}
                        keyExtractor={(item) => item.id}
                        columns={[
                          {
                            key: 'orderNumber',
                            title: 'Order',
                            width: 120,
                            render: (item: OrderSummary) => (
                              <ThemedText type="bodySmall" style={{ fontWeight: '600' }}>
                                {item.orderNumber}
                              </ThemedText>
                            ),
                          },
                          {
                            key: 'customerName',
                            title: 'Customer',
                            render: (item: OrderSummary) => (
                              <ThemedText type="bodySmall">{item.customerName}</ThemedText>
                            ),
                          },
                          {
                            key: 'total',
                            title: 'Total',
                            width: 80,
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
                            width: 100,
                            render: (item: OrderSummary) => (
                              <OrderStatusBadge status={item.status} />
                            ),
                          },
                        ]}
                      />
                    )}
                  </Card>
                </View>

                {/* Sidebar */}
                <View style={{ flex: 1, minWidth: 260, gap: Spacing.four }}>
                  {/* Popular Items */}
                  <Card>
                    <CardHeader title="Popular Items" subtitle="Most ordered" />
                    <View style={{ gap: Spacing.two }}>
                      {popularItems.length === 0 ? (
                        <ThemedText type="bodySmall" style={{ color: colors.textTertiary }}>
                          No data yet.
                        </ThemedText>
                      ) : (
                        popularItems.map((item, i) => (
                          <View key={item.id}>
                            <View
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
                                    borderRadius: 12,
                                    backgroundColor: colors.primarySubtle,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <ThemedText type="caption" style={{ color: colors.primary, fontSize: 11 }}>
                                    {i + 1}
                                  </ThemedText>
                                </View>
                                <ThemedText type="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
                                  {item.name}
                                </ThemedText>
                              </View>
                              <ThemedText type="bodySmall" style={{ color: colors.textSecondary, fontWeight: '600' }}>
                                {item.totalOrdered}x
                              </ThemedText>
                            </View>
                            {i < popularItems.length - 1 && <Divider />}
                          </View>
                        ))
                      )}
                    </View>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader title="Quick Actions" />
                    <View style={{ gap: Spacing.two }}>
                      <QuickAction label="New Order" icon="+" />
                      <QuickAction label="Reserve Table" icon="#" />
                      <QuickAction label="Add Customer" icon="@" />
                      <QuickAction label="View Reports" icon="%" />
                    </View>
                  </Card>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'default' | 'error'> = {
    pending: 'warning',
    preparing: 'info',
    ready: 'primary',
    served: 'success',
    completed: 'default',
    cancelled: 'error',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge label={label} variant={variantMap[status] ?? 'default'} />;
}

function QuickAction({ label, icon }: { label: string; icon: string }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.three,
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.two,
        borderRadius: 8,
        backgroundColor: hovered ? colors.surfaceHover : 'transparent',
      }}
    >
      <ThemedText style={{ fontSize: 16 }}>{icon}</ThemedText>
      <ThemedText type="bodySmall" style={{ color: colors.textPrimary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
