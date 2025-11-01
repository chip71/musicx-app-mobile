import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
// 1. Import the new dropdown component
import { Dropdown } from 'react-native-element-dropdown';

const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999'
    : Platform.OS === 'web'
    ? 'http://localhost:9999'
    : 'http://192.168.137.1:9999';

// 2. Define status items for the Dropdown
const statusItems = [
  { label: 'Pending', value: 'pending' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ManageOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders list
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/orders`);
      let data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      // Sort by date, newest first
      data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(data);
    } catch (err) {
      console.error(err.message);
      Alert.alert('Error', 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}`, { status: newStatus });
      Alert.alert('✅ Success', 'Order status updated');
      fetchOrders(); // Refresh the list
    } catch (err) {
      console.error(err.message);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order #{item.orderId}</Text>
      <Text style={styles.amount}>
        Total: {item.totalAmount?.toLocaleString() || 0} VND
      </Text>
      <Text style={styles.date}>
        Date: {item.orderDate ? new Date(item.orderDate).toLocaleString() : 'N/A'}
      </Text>

      <View style={{ marginTop: 10 }}>
        {/* Display status with color */}
        <Text style={[styles.status(item.status), { marginBottom: 5 }]}>
          {item.status?.toUpperCase().replace('_', ' ')}
        </Text>

        {/* 3. Use the <Dropdown> component */}
        <Dropdown
          style={[
            styles.dropdown,
            // Apply disabled style if 'cancelled' OR 'delivered'
            (item.status === 'cancelled' || item.status === 'delivered') &&
              styles.disabledDropdown,
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={statusItems}
          maxHeight={300}
          labelField="label" // Field name for display
          valueField="value" // Field name for value
          placeholder="Change status"
          value={item.status} // Current value
          onChange={(selectedItem) => {
            // selectedItem is the full object { label: '...', value: '...' }
            if (selectedItem.value !== item.status) {
              updateStatus(item._id, selectedItem.value);
            }
          }}
          // Disable component if 'cancelled' OR 'delivered'
          disable={item.status === 'cancelled' || item.status === 'delivered'}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={renderOrder}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 30 }}>No orders found</Text>
      }
    />
  );
};

export default ManageOrdersScreen;

// 4. Updated StyleSheet
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  amount: { color: '#333', marginTop: 5 },
  date: { color: '#666', fontSize: 12, marginBottom: 8 },
  status: (status) => ({
    color:
      status === 'delivered'
        ? 'green'
        : status === 'shipped'
        ? 'orange'
        : status === 'cancelled'
        ? 'red'
        : 'blue',
    fontWeight: 'bold',
    fontSize: 14,
  }),
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // --- New Styles for Dropdown ---
  dropdown: {
    height: 44,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'gray',
  },
  disabledDropdown: {
    backgroundColor: '#f0f0f0', // Light gray background when disabled
    borderColor: '#ccc',
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});