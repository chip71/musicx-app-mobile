import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// ✅ Match your API setup style
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999'
    : Platform.OS === 'web'
    ? 'http://localhost:9999'
    : 'http://192.168.137.1:9999';

const OrderDetailScreen = ({ route }) => {
  const { order } = route.params;
  const [status, setStatus] = useState(order.status);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Cancel order function
  const handleCancelOrder = async () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsProcessing(true);
            const res = await axios.put(`${API_URL}/api/orders/${order._id}/cancel`);
            setStatus('cancelled');
            Alert.alert('✅ Success', res.data.message || 'Order cancelled successfully.');
          } catch (err) {
            console.error('Cancel error:', err);
            Alert.alert(
              '❌ Network Error',
              'Could not connect to the server. Please check your API URL or network.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Order ID:</Text>
        <Text style={styles.value}>{order.orderId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Order Date:</Text>
        <Text style={styles.value}>
          {new Date(order.orderDate).toLocaleString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, styles[`status${status}`]]}>
          {status.toUpperCase()}
        </Text>
      </View>

      <View style={[styles.section, styles.itemsSection]}>
        <Text style={styles.label}>Items:</Text>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.item}>
            • {item.name} (x{item.quantity}) —{' '}
            {item.pricePerUnit.toLocaleString()} {order.currency}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Total Amount:</Text>
        <Text style={styles.total}>
          {order.totalAmount.toLocaleString()} {order.currency}
        </Text>
      </View>

      {order.shippingAddress && (
        <View style={styles.section}>
          <Text style={styles.label}>Shipping Address:</Text>
          <Text style={styles.value}>
            {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
            {order.shippingAddress.country}
          </Text>
        </View>
      )}

      {/* ✅ Cancel button only for pending orders */}
      {status !== 'shipped' &&
        status !== 'delivered' &&
        status !== 'cancelled' && (
          <TouchableOpacity
            style={[styles.cancelButton, isProcessing && { opacity: 0.6 }]}
            onPress={handleCancelOrder}
            disabled={isProcessing}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>
              {isProcessing ? 'Cancelling...' : 'Cancel Order'}
            </Text>
          </TouchableOpacity>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // ✅ clean white background
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  section: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
  itemsSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    marginTop: 8,
  },
  item: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    marginVertical: 3,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1DB954', // ✅ Spotify green highlight
    marginTop: 4,
  },
  // ✅ Status colors
  statuspending: { color: '#FFD700' },
  statuspending_payment: { color: '#FFA500' },
  statusshipped: { color: '#1E90FF' },
  statusdelivered: { color: '#1DB954' },
  statuscancelled: { color: '#FF3B30' },
  // ✅ Cancel button
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OrderDetailScreen;
