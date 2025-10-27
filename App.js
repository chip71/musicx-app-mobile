// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AuthProvider } from './src/context/AuthContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import AlbumDetailScreen from './src/screens/AlbumDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import ArtistDetailScreen from './src/screens/ArtistDetailScreen';

// Navigation setup
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <ProfileStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <ProfileStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Explore"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          switch (route.name) {
            case 'Explore':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Album':
              iconName = focused ? 'albums' : 'albums-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={HomeScreen} />
      <Tab.Screen name="Album" component={AlbumScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
