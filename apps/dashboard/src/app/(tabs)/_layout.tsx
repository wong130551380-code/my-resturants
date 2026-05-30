import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function TabIcon({ name }: { name: string }) {
  return <Text style={{ fontSize: 18 }}>{name}</Text>;
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: 60,
          paddingTop: Spacing.one,
          paddingBottom: Spacing.two,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <TabIcon name="🏠" />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: () => <TabIcon name="📋" />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: () => <TabIcon name="🍽" />,
        }}
      />
      <Tabs.Screen
        name="crm"
        options={{
          title: 'CRM',
          tabBarIcon: () => <TabIcon name="👥" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: () => <TabIcon name="⚙️" />,
        }}
      />
      <Tabs.Screen
        name="ui-library"
        options={{
          title: 'UI Library',
          href: null,
        }}
      />
    </Tabs>
  );
}
