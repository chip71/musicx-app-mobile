// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth, AuthProvider } from './src/context/AuthContext';

// Screens (User)
import HomeScreen from './src/screens/HomeScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import AlbumDetailScreen from './src/screens/AlbumDetailScreen';
import ArtistDetailScreen from './src/screens/ArtistDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AfterCheckoutDetailScreen from './src/screens/AfterCheckoutDetailScreen';

// Screens (Profile)
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

// Screens (Admin)
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import ManageOrdersScreen from './src/screens/ManageOrdersScreen'; // ✅ NEW IMPORT
import ManageAlbumsScreen from './src/screens/ManageAlbumsScreen'; // ✅ NEW
import ManageArtistsScreen from './src/screens/ManageArtistsScreen';

// Navigation setup
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

// ✅ Profile stack (user login/register/profile)
function ProfileStackScreen() {
  const { user } = useAuth();

  return (
    <ProfileStack.Navigator>
      {!user ? (
        <>
          <ProfileStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Sign In' }}
          />
          <ProfileStack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
        </>
      ) : (
        <>
          <ProfileStack.Screen
            name="ProfileMain"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <ProfileStack.Screen
            name="OrderHistory"
            component={OrderHistoryScreen}
            options={{ title: 'My Orders' }}
          />
          <ProfileStack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{ title: 'Order Detail' }}
          />
          <ProfileStack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Edit Profile' }}
          />
          <ProfileStack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ title: 'Change Password' }}
          />
        </>
      )}
    </ProfileStack.Navigator>
  );
}

// ✅ Tabs — dynamic by role
function MainTabs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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
              iconName = user
                ? focused
                  ? 'person'
                  : 'person-outline'
                : focused
                  ? 'log-in'
                  : 'log-in-outline';
              break;
            case 'Dashboard':
              iconName = focused ? 'speedometer' : 'speedometer-outline';
              break;
          }

          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      {/* Common tabs */}
      <Tab.Screen name="Explore" component={HomeScreen} />
      <Tab.Screen name="Album" component={AlbumScreen} />

      {/* Customer-only tabs */}
      {!isAdmin && (
        <>
          <Tab.Screen name="Cart" component={CartScreen} />
          <Tab.Screen
            name="Profile"
            component={ProfileStackScreen}
            options={{
              title: user ? 'Profile' : 'Login',
            }}
          />
        </>
      )}

      {/* Admin-only tab */}
      {isAdmin && (
        <Tab.Screen
          name="Dashboard"
          component={AdminDashboardScreen}
          options={{ title: 'Dashboard' }}
        />
      )}
    </Tab.Navigator>
  );
}

// ✅ Main App
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AlbumDetail"
            component={AlbumDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ArtistDetail"
            component={ArtistDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: 'Checkout' }}
          />
          <Stack.Screen
            name="AfterCheckoutDetail"
            component={AfterCheckoutDetailScreen}
            options={{ headerShown: false }}
          />

          {/* ✅ Admin-only routes */}
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManageOrders"
            component={ManageOrdersScreen}
            options={{ title: 'Manage Orders' }}
          />
          <Stack.Screen
            name="ManageAlbums"
            component={ManageAlbumsScreen}
            options={{ title: "Manage Albums" }}
          />
          <Stack.Screen
            name="ManageArtists"
            component={ManageArtistsScreen}
            options={{ title: 'Manage Artists' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
