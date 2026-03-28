import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../store/auth.store';
import { LoadingScreen } from '../components/common';
import { AuthScreen } from '../screens/AuthScreen';
// Import other screens (to be created)
// import { DashboardScreen } from '../screens/DashboardScreen';
// import { AdsScreen } from '../screens/AdsScreen';
// import { WithdrawScreen } from '../screens/WithdrawScreen';
// import { SettingsScreen } from '../screens/SettingsScreen';
// import { AdminScreen } from '../screens/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Ads':
              iconName = focused ? 'play-circle' : 'play-circle-outline';
              break;
            case 'Withdraw':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d4af37',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: '#050505',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '900',
          textTransform: 'uppercase',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreenPlaceholder}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Ads"
        component={AdsScreenPlaceholder}
        options={{ title: 'Watch Ads' }}
      />
      <Tab.Screen
        name="Withdraw"
        component={WithdrawScreenPlaceholder}
        options={{ title: 'Withdraw' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreenPlaceholder}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Placeholder screens (replace with actual implementations)
function DashboardScreenPlaceholder() {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.text}>Dashboard Screen</Text>
    </View>
  );
}

function AdsScreenPlaceholder() {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.text}>Ads Screen</Text>
    </View>
  );
}

function WithdrawScreenPlaceholder() {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.text}>Withdraw Screen</Text>
    </View>
  );
}

function SettingsScreenPlaceholder() {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.text}>Settings Screen</Text>
    </View>
  );
}

// Main App Navigator
export const AppNavigator = () => {
  const { user, loading, initialize } = useAuth();

  React.useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  if (loading) {
    return <LoadingScreen message="Loading AdEarn Pro..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '600',
  },
});
