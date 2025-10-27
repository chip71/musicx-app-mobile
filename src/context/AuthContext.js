import React, { createContext, useState, useContext } from 'react';
import { Platform, Alert } from 'react-native';
import axios from 'axios';

// --- API URL Setup ---
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999' // For Android Emulator
    : Platform.OS === 'web'
    ? 'http://localhost:9999' // For Web
    : 'http://192.168.137.1:9999'; // For physical device (ensure this is your current IP)

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object has _id, name, email
  const [cart, setCart] = useState([]); // Cart items have albumId (which is the album's _id string)

  // --- Auth Functions ---
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      setUser(res.data); // Should receive { _id, name, email }
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
      setUser(res.data); // Should receive { _id, name, email }
      Alert.alert('✅ Success', 'Account created! Welcome.');
      return true;
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('❌ Error', err.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]); // Optionally clear cart on logout
  };

  // --- Cart Functions ---

  /**
   * Adds an item to the cart. If it already exists, increments quantity.
   */
  const addToCart = (itemData) => {
    // ✅ FIX: Use _id from album object (itemData) or albumId from cart item object (itemData)
    const id = itemData._id || itemData.albumId;

    // Check if item already exists using the correct ID
    const existingItem = cart.find((item) => item.albumId === id);

    setCart((prevCart) => {
      if (existingItem) {
        // Increment quantity
        return prevCart.map((item) =>
          item.albumId === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item (only happens from AlbumDetailScreen where itemData is the full album object)
        if (!itemData._id) {
           console.error("addToCart called with invalid itemData (missing _id):", itemData);
           Alert.alert("Error", "Could not add item to cart.");
           return prevCart; // Return previous cart state if item data is bad
        }
        const newItem = {
          // ✅ FIX: Use itemData._id when creating the new cart item
          albumId: itemData._id,
          name: itemData.name,
          sku: itemData.sku,
          pricePerUnit: itemData.price,
          image: itemData.image,
          quantity: 1,
        };
        return [...prevCart, newItem];
      }
    });

    // Only show alert if it's a *new* item being added
    if (!existingItem) {
        Alert.alert('Added to Cart', `${itemData.name} has been added.`);
    }
  };

  /**
   * Decrements an item's quantity. If quantity becomes 0, removes it.
   */
  const decrementItem = (albumId) => { // albumId is the string _id
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.albumId === albumId);

      if (existingItem && existingItem.quantity === 1) {
        // Remove item
        return prevCart.filter((item) => item.albumId !== albumId);
      } else if (existingItem) {
        // Decrement quantity
        return prevCart.map((item) =>
          item.albumId === albumId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart; // Return unchanged cart if item not found
    });
  };

  /**
   * Completely removes an item from the cart, regardless of quantity.
   */
  const removeFromCart = (albumId) => { // albumId is the string _id
    setCart((prevCart) => {
      return prevCart.filter((item) => item.albumId !== albumId);
    });
  };

  /**
   * Empties the entire cart.
   */
  const clearCart = () => {
    setCart([]);
  };

  return (
    <AuthContext.Provider
      value={{
        // Auth state and functions
        user,
        login,
        register,
        logout,
        // Cart state and functions
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

// 3. Create a custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};