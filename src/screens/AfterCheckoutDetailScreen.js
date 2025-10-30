import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999'
    : Platform.OS === 'web'
    ? 'http://localhost:9999'
    : 'http://192.168.137.1:9999';

const AfterCheckoutDetailScreen = ({ route, navigation }) => {
  const { orderPayload } = route.params || {};
  const { user, clearCart } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      if (!orderPayload || !orderPayload.items?.length) {
        Alert.alert('Error', 'No items found in your order.');
        return;
      }

      setLoading(true);

      const payload = {
        userId: user?._id,
        orderId: orderPayload.orderId,
        items: orderPayload.items.map((item) => ({
          albumId: item._id || item.albumId,
          sku:
            item.sku ||
            `SKU-${item._id || item.albumId || Math.random().toString(36).substring(2, 7)}`,
          name: item.name || item.title || 'Untitled Album',
          quantity: item.quantity || 1,
          pricePerUnit: item.pricePerUnit || item.price || 0,
        })),
        subtotal: orderPayload.subtotal,
        shippingPrice: orderPayload.shippingPrice,
        discount: orderPayload.discount,
        totalAmount: orderPayload.totalAmount,
        currency: 'VND',
        shippingAddress: orderPayload.shippingAddress,
        shippingMethod: orderPayload.shippingMethod,
        paymentMethod: orderPayload.paymentMethod,
        orderDate: new Date().toISOString(),
        status: 'pending',
      };

      console.log('📦 Sending order payload:', JSON.stringify(payload, null, 2));

      const res = await axios.post(`${API_URL}/api/orders`, payload);

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Order not created');
      }

      clearCart();
      setLoading(false);

      // ✅ Redirect directly to Home (Explore) tab
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              routes: [{ name: 'Explore' }],
              index: 0, // ensures Explore tab is selected
            },
          },
        ],
      });
    } catch (err) {
      setLoading(false);
      console.error('❌ Order failed:', err.response?.data || err.message);
      Alert.alert(
        'Error',
        `Order failed: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleCancel = () => navigation.goBack();

  if (!orderPayload) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No order data found.</Text>
      </SafeAreaView>
    );
  }

  const {
    shippingAddress,
    shippingMethod,
    paymentMethod,
    items,
    subtotal,
    shippingPrice,
    discount,
    totalAmount,
    promoCode,
  } = orderPayload;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Your Order</Text>
        </View>

        {/* Items Section */}
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.summaryBox}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>
                {(item.pricePerUnit * item.quantity).toLocaleString()} VND
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>{subtotal.toLocaleString()} VND</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Shipping</Text>
            <Text style={styles.costValue}>{shippingPrice.toLocaleString()} VND</Text>
          </View>
          {discount > 0 && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Discount ({promoCode || 'Promo'})</Text>
              <Text style={styles.costValue}>-{discount.toLocaleString()} VND</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{totalAmount.toLocaleString()} VND</Text>
          </View>
        </View>

        {/* Shipping Info */}
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Recipient: </Text>
            {shippingAddress?.recipient}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Address: </Text>
            {shippingAddress?.street}, {shippingAddress?.city}, {shippingAddress?.country}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Shipping Method: </Text>
            {shippingMethod === 'express' ? 'Express (70,000 VND)' : 'Standard (30,000 VND)'}
          </Text>
        </View>

        {/* Payment */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {paymentMethod === 'momo'
              ? 'MoMo Wallet'
              : paymentMethod === 'card'
              ? 'Credit / Debit Card'
              : 'Cash on Delivery (COD)'}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancel]}
            onPress={handleCancel}
            disabled={loading}>
            <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirm]}
            onPress={handleConfirm}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, styles.confirmText]}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AfterCheckoutDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginVertical: 12 },
  summaryBox: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { flex: 1, color: '#000', fontSize: 16 },
  itemQty: { width: 30, textAlign: 'center', color: '#000' },
  itemPrice: { width: 120, textAlign: 'right', color: '#000' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginVertical: 8 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  costLabel: { color: '#333' },
  costValue: { color: '#000' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
  },
  totalLabel: { fontWeight: '700', fontSize: 17 },
  totalValue: { fontWeight: '700', fontSize: 17 },
  infoBox: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15 },
  infoText: { color: '#000', fontSize: 15, marginVertical: 3 },
  bold: { fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginHorizontal: 6,
  },
  cancel: { backgroundColor: '#fff', borderColor: '#000' },
  confirm: { backgroundColor: '#000', borderColor: '#000' },
  buttonText: { fontWeight: '600', fontSize: 16 },
  cancelText: { color: '#000' },
  confirmText: { color: '#fff' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 30 },
});
