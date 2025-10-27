import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// --- API Base URL ---
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9999' // Android emulator
    : Platform.OS === 'web'
    ? 'http://localhost:9999' // Web
    : 'http://192.168.1.100:9999'; // ⚠️ Thay IP này bằng IP LAN thật của máy chạy server

const CheckoutScreen = ({ navigation }) => {
  const { user, cart, clearCart } = useAuth();

  const [form, setForm] = useState({
    recipient: user?.name || '',
    street: '',
    city: '',
    country: 'Vietnam',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleInputChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // --- Cost Calculations ---
  const subtotal = cart.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0
  );
  const shippingPrice = shippingMethod === 'standard' ? 30000 : 70000;
  const totalAmount = subtotal + shippingPrice - discount;

  // --- Apply Promo ---
  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'MUSICX10') {
      setDiscount(subtotal * 0.1);
      Alert.alert('✅ Success', '10% discount applied!');
    } else {
      setDiscount(0);
      Alert.alert('❌ Invalid Code', 'Please enter a valid promo code.');
    }
  };

  // --- Place Order ---
  const handlePlaceOrder = async () => {
    if (!form.recipient || !form.street || !form.city) {
      Alert.alert('Missing Info', 'Please fill in all shipping fields.');
      return;
    }
    if (!user || !user._id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    const orderPayload = {
      userId: user._id,
      items: cart.map((item) => ({
        albumId: item.albumId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
      })),
      shippingAddress: form,
      paymentMethod,
      shippingMethod,
      subtotal,
      shippingPrice,
      discount,
      totalAmount,
      currency: 'VND',
      status: 'pending',
      orderDate: new Date().toISOString(),
    };

    try {
      if (paymentMethod === 'momo') {
        Alert.alert('Redirecting to MoMo...');
        const res = await axios.post(
          `${API_URL}/api/payments/momo/create-link`,
          orderPayload
        );
        const payUrl = res.data.payUrl;
        if (payUrl) {
          const canOpen = await Linking.canOpenURL(payUrl);
          if (canOpen) {
            await Linking.openURL(payUrl);
            clearCart();
            navigation.popToTop();
          } else {
            Alert.alert('Error', 'Cannot open MoMo. Please check installation.');
          }
        }
      } else {
        await axios.post(`${API_URL}/api/orders`, orderPayload);
        clearCart();
        navigation.popToTop();
      }
    } catch (err) {
      console.error('❌ Order failed:', err);
      const msg =
        err.response?.data?.message ||
        'Could not place your order. Please try again.';
      Alert.alert('Order Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Checkout</Text>

        {/* --- Order Summary --- */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryBox}>
          {cart.map((item) => (
            <View key={item.albumId} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {item.name} (x{item.quantity})
              </Text>
              <Text style={styles.itemText}>
                {(item.pricePerUnit * item.quantity).toLocaleString()} VND
              </Text>
            </View>
          ))}
          <View style={styles.costRow}>
            <Text style={styles.itemText}>Subtotal</Text>
            <Text style={styles.itemText}>{subtotal.toLocaleString()} VND</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.itemText}>Shipping</Text>
            <Text style={styles.itemText}>
              {shippingPrice.toLocaleString()} VND
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.costRow}>
              <Text style={styles.discountText}>Discount (MUSICX10)</Text>
              <Text style={styles.discountText}>
                -{discount.toLocaleString()} VND
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {totalAmount.toLocaleString()} VND
            </Text>
          </View>
        </View>

        {/* --- Shipping Info --- */}
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        {['recipient', 'street', 'city', 'country'].map((field, i) => (
          <View style={styles.inputContainer} key={i}>
            <TextInput
              placeholder={
                field === 'recipient'
                  ? 'Recipient Name'
                  : field === 'street'
                  ? 'Street Address'
                  : field === 'city'
                  ? 'City (e.g., Quận 1, TP.HCM)'
                  : 'Country'
              }
              style={styles.input}
              value={form[field]}
              onChangeText={(v) => handleInputChange(field, v)}
            />
          </View>
        ))}

        {/* --- Shipping Method --- */}
        <Text style={styles.sectionTitle}>Shipping Method</Text>
        {[
          { key: 'standard', label: 'Standard (30,000 VND)' },
          { key: 'express', label: 'Express (70,000 VND)' },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.optionButton,
              shippingMethod === opt.key && styles.optionButtonSelected,
            ]}
            onPress={() => setShippingMethod(opt.key)}>
            <Ionicons
              name={
                shippingMethod === opt.key
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color="#000"
            />
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        {/* --- Promo --- */}
        <Text style={styles.sectionTitle}>Promo Code</Text>
        <View style={styles.promoContainer}>
          <TextInput
            placeholder="Enter code (e.g., MUSICX10)"
            style={[styles.input, styles.promoInput]}
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyPromo}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* --- Payment --- */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {[
          { key: 'cod', label: 'Cash on Delivery (COD)' },
          { key: 'momo', label: 'MoMo Wallet' },
          { key: 'card', label: 'Credit / Debit Card (Mock)' },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.optionButton,
              paymentMethod === opt.key && styles.optionButtonSelected,
            ]}
            onPress={() => setPaymentMethod(opt.key)}>
            <Ionicons
              name={
                paymentMethod === opt.key
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color="#000"
            />
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        {/* --- Place Order --- */}
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  itemText: { fontSize: 16, color: '#333' },
  discountText: { fontSize: 16, color: 'green' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 18, fontWeight: 'bold' },
  inputContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: { color: '#000', fontSize: 16 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#FFF',
    borderColor: '#000',
    borderWidth: 2,
  },
  optionText: { fontSize: 16, marginLeft: 10 },
  promoContainer: { flexDirection: 'row', alignItems: 'center' },
  promoInput: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
  },
  applyButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  applyButtonText: { color: '#FFF', fontWeight: 'bold' },
  placeOrderButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  placeOrderButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default CheckoutScreen;
