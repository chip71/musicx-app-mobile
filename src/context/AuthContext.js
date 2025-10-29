import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- API URL Setup ---
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999' // Android Emulator
    : Platform.OS === 'web'
    ? 'http://localhost:9999' // Web
    : 'http://192.168.137.1:9999'; // Physical device (replace with your IP)

// --- Create Context ---
const AuthContext = createContext();

// --- Provider Component ---
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // ✅ Load saved cart and user from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading saved data:', err);
      }
    };
    loadData();
  }, []);

  // ✅ Persist cart
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(cart)).catch((err) =>
      console.error('Error saving cart:', err)
    );
  }, [cart]);

  // ✅ Persist user
  useEffect(() => {
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('user');
    }
  }, [user]);

  // --- Auth Functions ---
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      setUser(res.data);
      Alert.alert('✅ Success', 'Welcome back!');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('❌ Error', err.response?.data?.message || 'Login failed.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      setUser(res.data);
      Alert.alert('✅ Success', 'Account created! Welcome.');
      return true;
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('❌ Error', err.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setCart([]);
    await AsyncStorage.multiRemove(['user', 'cart']);
  };

  // --- Cart Functions ---

  const addToCart = (itemData) => {
    // ✅ Fix: handle both album objects (with _id) and cart items (with albumId)
    const id = itemData._id || itemData.albumId;
    const price = itemData.price || itemData.pricePerUnit;
    const existingItem = cart.find((item) => item.albumId === id);

    setCart((prevCart) => {
      if (existingItem) {
        // increase quantity
        return prevCart.map((item) =>
          item.albumId === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (!id) {
          console.error('addToCart called with invalid itemData:', itemData);
          Alert.alert('Error', 'Could not add item to cart.');
          return prevCart;
        }
        const newItem = {
          albumId: id,
          name: itemData.name,
          sku: itemData.sku,
          pricePerUnit: price,
          image: itemData.image,
          quantity: 1,
        };
        return [...prevCart, newItem];
      }
    });

    if (!existingItem) {
      Alert.alert('🛒 Added to Cart', `${itemData.name} has been added.`);
    }
  };

  const decrementItem = (albumId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.albumId === albumId);
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter((item) => item.albumId !== albumId);
      } else if (existingItem) {
        return prevCart.map((item) =>
          item.albumId === albumId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart;
    });
  };

  const removeFromCart = (albumId) => {
    setCart((prevCart) => prevCart.filter((item) => item.albumId !== albumId));
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('cart');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        cart,
        addToCart,
        decrementItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook to Use Context ---
export const useAuth = () => useContext(AuthContext);
