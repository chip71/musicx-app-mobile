import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:9999"
    : Platform.OS === "web"
    ? "http://localhost:9999"
    : "http://192.168.137.1:9999";

const statusItems = [
  { label: "Pending", value: "pending" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const ManageOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/orders`);
      let data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error(err.message);
      Alert.alert("Error", "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔍 Lọc theo orderId
  useEffect(() => {
    if (!search.trim()) setFilteredOrders(orders);
    else {
      const keyword = search.toLowerCase();
      setFilteredOrders(
        orders.filter((o) =>
          String(o.orderId).toLowerCase().includes(keyword)
        )
      );
    }
  }, [search, orders]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}`, { status: newStatus });
      Alert.alert("✅ Success", "Order status updated");
      fetchOrders();
    } catch (err) {
      console.error(err.message);
      Alert.alert("Error", "Failed to update order status");
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order #{item.orderId}</Text>
      <Text style={styles.amount}>
        Total: {item.totalAmount?.toLocaleString() || 0} VND
      </Text>
      <Text style={styles.date}>
        Date:{" "}
        {item.orderDate ? new Date(item.orderDate).toLocaleString() : "N/A"}
      </Text>

      <View style={{ marginTop: 10 }}>
        <Text style={[styles.status(item.status), { marginBottom: 5 }]}>
          {item.status?.toUpperCase().replace("_", " ")}
        </Text>

        <Dropdown
          style={[
            styles.dropdown,
            (item.status === "cancelled" || item.status === "delivered") &&
              styles.disabledDropdown,
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={statusItems}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Change status"
          value={item.status}
          onChange={(selectedItem) => {
            if (selectedItem.value !== item.status) {
              updateStatus(item._id, selectedItem.value);
            }
          }}
          disable={item.status === "cancelled" || item.status === "delivered"}
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
    <View style={styles.container}>
      <Text style={styles.title}>Manage Orders</Text>

      {/* 🔍 Thanh search giống Manage Genres */}
      <TextInput
        placeholder="Search orders..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30 }}>
            No orders found
          </Text>
        }
      />
    </View>
  );
};

export default ManageOrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f7f7f7",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: "bold", color: "#000" },
  amount: { color: "#333", marginTop: 5 },
  date: { color: "#666", fontSize: 12, marginBottom: 8 },
  status: (status) => ({
    color:
      status === "delivered"
        ? "green"
        : status === "shipped"
        ? "orange"
        : status === "cancelled"
        ? "red"
        : "blue",
    fontWeight: "bold",
    fontSize: 14,
  }),
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  dropdown: {
    height: 44,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "gray",
  },
  disabledDropdown: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  placeholderStyle: { fontSize: 15, color: "#999" },
  selectedTextStyle: { fontSize: 16, color: "black" },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 16 },
});
