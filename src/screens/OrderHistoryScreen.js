import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // ✅ import

// --- API URL SETUP ---
const API_URL = "https://musicx-mobile-backend.onrender.com";
console.log("🔗 Using API:", API_URL);

// --- Helper to format date ---
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// --- Order Card ---
const OrderCard = ({ order, onViewDetail }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <Text style={styles.orderId}>{order.orderId}</Text>
      <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
    </View>

    <View style={styles.orderDetails}>
      {order.items.map((item, index) => (
        <Text key={index} style={styles.itemText} numberOfLines={1}>
          • {item.name} (x{item.quantity})
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

    <TouchableOpacity style={styles.detailButton} onPress={() => onViewDetail(order)}>
      <Text style={styles.detailButtonText}>View Details</Text>
    </TouchableOpacity>
  </View>
);

// --- Main Screen ---
const OrderHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Tách fetchOrders ra ngoài useEffect để gọi lại khi focus
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
      setOrders(response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load order history.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Reload orders khi màn hình được focus (ví dụ: back từ OrderDetail)
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [user])
  );

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
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onViewDetail={() => navigation.navigate('OrderDetail', { order: item })}
          />
        )}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#888', marginTop: 10, textAlign: 'center' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 15, color: '#000' },
  listContent: { paddingBottom: 20 },
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  orderDate: { fontSize: 13, color: '#666' },
  orderDetails: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 14, color: '#444', marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: {
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    color: '#fff',
  },
  statuspending: { backgroundColor: '#ff960cff' },
  statuspending_payment: { backgroundColor: '#bf9f00ff' },
  statusshipped: { backgroundColor: '#1E90FF' },
  statusdelivered: { backgroundColor: '#1DB954' },
  statuscancelled: { backgroundColor: '#FF3B30' },
  totalAmount: { fontWeight: '700', fontSize: 16, color: '#000' },
  detailButton: {
    backgroundColor: '#000',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

export default OrderHistoryScreen;
