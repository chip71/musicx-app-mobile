import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// --- API URL SETUP ---
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999'
    : Platform.OS === 'web'
    ? 'http://localhost:9999'
    : 'http://192.168.137.1:9999'; // Ensure this IP is correct

// --- Helper to format date ---
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// --- Order Item Component ---
const OrderCard = ({ order }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <Text style={styles.orderId}>{order.orderId}</Text>
      <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
    </View>
    <View style={styles.orderDetails}>
      {order.items.map((item, index) => (
        <Text key={index} style={styles.itemText} numberOfLines={1}>
          - {item.name} (x{item.quantity})
        </Text>
      ))}
    </View>
    <View style={styles.orderFooter}>
      <Text style={[styles.status, styles[`status${order.status}`]]}>
        {order.status.toUpperCase()}
      </Text>
      <Text style={styles.totalAmount}>
        {order.totalAmount.toLocaleString()} {order.currency}
      </Text>
    </View>
  </View>
);

// --- Main Screen Component ---
const OrderHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        setError('You must be logged in to view order history.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/users/${user._id}/orders`);
        setOrders(response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))); // Sort newest first
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Could not load order history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Re-fetch if user changes

  // --- Render Logic ---
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading Orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        {/* Optional: Add a button to go back or retry */}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListHeaderComponent={<Text style={styles.screenTitle}>My Orders</Text>}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#888', marginTop: 10, textAlign: 'center' },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 10, // Adjust if using a custom header later
    paddingBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  orderDate: { fontSize: 12, color: '#666' },
  orderDetails: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: { fontSize: 14, color: '#444', marginBottom: 2 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden', // Ensures background color respects border radius
    color: '#FFF',
  },
  // Status-specific background colors (adjust as needed)
  statuspending: { backgroundColor: '#FFA500' }, // Orange
  statuspending_payment: { backgroundColor: '#FFD700' }, // Gold
  statusshipped: { backgroundColor: '#1E90FF' }, // DodgerBlue
  statusdelivered: { backgroundColor: '#32CD32' }, // LimeGreen
  statuscancelled: { backgroundColor: '#FF4500' }, // OrangeRed
  totalAmount: { fontWeight: 'bold', fontSize: 16 },
});

export default OrderHistoryScreen;