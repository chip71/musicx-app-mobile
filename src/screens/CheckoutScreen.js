import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// --- LOCAL BACKEND URL ---
const API_URL = "https://musicx-mobile-backend.onrender.com";
console.log("🔗 Using API:", API_URL);


const CheckoutScreen = ({ navigation }) => {
  const { user, cart, clearCart } = useAuth();

  const [form, setForm] = useState({
    recipient: user?.name || '',
    street: '',
    city: '',
    country: 'Vietnam',
  });
  const [errors, setErrors] = useState({});
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const shippingPrice = shippingMethod === 'express' ? 70000 : 30000;
  const totalAmount = subtotal + shippingPrice - discount;

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'MUSICX10') {
      setDiscount(Math.round(subtotal * 0.1));
      Alert.alert('✅ Success', '10% discount applied!');
    } else {
      setDiscount(0);
      Alert.alert('❌ Invalid Code', 'Please enter a valid promo code.');
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.recipient.trim()) newErrors.recipient = 'Recipient name is required.';
    else if (!/^[\p{L}\s]+$/u.test(form.recipient.trim()))
      newErrors.recipient = 'Recipient name must contain only letters.';
    if (!form.street.trim()) newErrors.street = 'Street address is required.';
    if (!form.city.trim()) newErrors.city = 'City is required.';
    if (!form.country.trim()) newErrors.country = 'Country is required.';
    else if (!/^[a-zA-Z\s]+$/.test(form.country.trim()))
      newErrors.country = 'Please enter a valid country name.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

//   const handlePlaceOrder = async () => {
//   if (!validateForm()) return;
//   if (!user || !user._id) {
//     Alert.alert('Error', 'User not found. Please log in again.');
//     return;
//   }

//   setLoading(true);

//   const orderItems = cart.map(item => ({
//     albumId: item.albumId,
//     sku: item.sku || `SKU_${item.albumId}`,
//     name: item.name || 'Unknown Album',
//     quantity: item.quantity || 1,
//     pricePerUnit: item.pricePerUnit || 0,
//   }));

//   const orderPayload = {
//     userId: user._id,
//     items: orderItems,
//     shippingAddress: form,
//     paymentMethod,
//     shippingMethod,
//     subtotal,
//     shippingPrice,
//     discount,
//     totalAmount,
//     currency: 'VND',
//     status: paymentMethod === 'momo' ? 'pending_payment' : 'pending',
//     orderDate: new Date().toISOString(),
//     promoCode: promoCode || null,
//   };

//   try {
//     if (paymentMethod === 'momo') {
//   try {
//     const res = await fetch(`${API_URL}/api/payments/momo/create-link`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(orderPayload),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || 'Failed to create MoMo payment link');

//     const payUrl = data.payUrl;
//     console.log('🟣 MoMo payUrl:', payUrl);

//     // 🚀 Mở link trực tiếp (hoạt động trên Web + điện thoại)
//     await Linking.openURL(payUrl);

//     // ⏳ Quay lại Explore sau 3 giây
//     setTimeout(() => {
//       clearCart();
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Explore' }], index: 0 } }],
//       });
//     }, 3000);
//   } catch (err) {
//     console.error('❌ MoMo payment failed:', err.message || err);
//     Alert.alert('Error', err.message || 'MoMo payment failed.');
//   } finally {
//     setLoading(false);
//   }
// }



//     // 🟢 COD / CARD
//     const res = await fetch(`${API_URL}/api/orders`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(orderPayload),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || 'Failed to create order');

//     Alert.alert('Order Placed', 'Your order has been placed successfully!');
//     clearCart();
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Explore' }], index: 0 } }],
//     });
//   } catch (err) {
//     console.error('❌ Order failed:', err.message || err);
//     Alert.alert('Error', err.message || 'Order failed.');
//   } finally {
//     setLoading(false);
//   }
// };

//sandbox
const handlePlaceOrder = async () => {
  if (!validateForm()) return;
  if (!user || !user._id) {
    Alert.alert('Error', 'User not found. Please log in again.');
    return;
  }

  setLoading(true);

  const orderItems = cart.map(item => ({
    albumId: item.albumId,
    sku: item.sku || `SKU_${item.albumId}`,
    name: item.name || 'Unknown Album',
    quantity: item.quantity || 1,
    pricePerUnit: item.pricePerUnit || 0,
  }));

  const orderPayload = {
    userId: user._id,
    items: orderItems,
    shippingAddress: form,
    paymentMethod,
    shippingMethod,
    subtotal,
    shippingPrice,
    discount,
    totalAmount,
  };

  try {
    if (paymentMethod === 'momo') {
      const res = await fetch(`${API_URL}/api/payments/momo/create-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create MoMo payment link');
      console.log('🟣 MoMo payUrl:', data.payUrl);

      await Linking.openURL(data.payUrl);
      clearCart();

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Explore' }] } }],
        });
      }, 3000);
    } else {
      // COD / CARD
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create order');
      Alert.alert('Order Placed', 'Your order has been placed successfully!');
      clearCart();

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Explore' }] } }],
      });
    }
  } catch (err) {
    console.error('❌ Order failed:', err);
    Alert.alert('Error', err.message || 'Order failed.');
  } finally {
    setLoading(false);
  }
};



  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cart */}
        <Text style={styles.title}>Your Cart</Text>
        {cart.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888' }}>No items in cart.</Text>
        ) : (
          <View style={styles.cartBox}>
            {cart.map((item, idx) => (
              <View key={idx} style={styles.cartRow}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartQty}>x{item.quantity}</Text>
                <Text style={styles.cartPrice}>{(item.pricePerUnit * item.quantity).toLocaleString()} VND</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.cartRow}>
              <Text style={{ fontWeight: 'bold' }}>Subtotal</Text>
              <Text></Text>
              <Text style={{ fontWeight: 'bold' }}>{subtotal.toLocaleString()} VND</Text>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        {['recipient', 'street', 'city', 'country'].map((field, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={[styles.inputContainer, errors[field] && { borderColor: 'red', borderWidth: 1 }]}>
              <TextInput
                placeholder={
                  field === 'recipient' ? 'Recipient Name' :
                  field === 'street' ? 'Street' :
                  field === 'city' ? 'City' : 'Country'
                }
                style={styles.input}
                value={form[field]}
                onChangeText={v => handleInputChange(field, v)}
              />
            </View>
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
          </View>
        ))}

        {/* Shipping Method */}
        <Text style={styles.sectionTitle}>Shipping Method</Text>
        {[
          { key: 'standard', label: 'Standard (30,000 VND)' },
          { key: 'express', label: 'Express (70,000 VND)' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionButton, shippingMethod === opt.key && styles.optionButtonSelected]}
            onPress={() => setShippingMethod(opt.key)}
          >
            <Ionicons
              name={shippingMethod === opt.key ? 'radio-button-on' : 'radio-button-off'}
              size={20} color="#000"
            />
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {[
          { key: 'cod', label: 'Cash on Delivery (COD)' },
          { key: 'momo', label: 'MoMo Wallet' },
          { key: 'card', label: 'Credit / Debit Card (Mock)' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionButton, paymentMethod === opt.key && styles.optionButtonSelected]}
            onPress={() => setPaymentMethod(opt.key)}
          >
            <Ionicons
              name={paymentMethod === opt.key ? 'radio-button-on' : 'radio-button-off'}
              size={20} color="#000"
            />
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Promo Code */}
        <Text style={styles.sectionTitle}>Promo Code</Text>
        <View style={styles.promoContainer}>
          <TextInput
            placeholder="Enter code (e.g., MUSICX10)"
            style={[styles.input, styles.promoInput]}
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Preview Summary */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Preview Summary</Text>
        <View style={styles.previewBox}>
          <Text style={styles.previewHeader}>Shipping Address</Text>
          <Text>{form.recipient}</Text>
          <Text>{form.street}, {form.city}, {form.country}</Text>
          <Text style={[styles.previewHeader, { marginTop: 10 }]}>Shipping Method</Text>
          <Text>{shippingMethod === 'express' ? 'Express (70,000 VND)' : 'Standard (30,000 VND)'}</Text>
          <Text style={[styles.previewHeader, { marginTop: 10 }]}>Payment Method</Text>
          <Text>{paymentMethod === 'momo' ? 'MoMo Wallet' : paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery (COD)'}</Text>
          {promoCode ? (
            <>
              <Text style={[styles.previewHeader, { marginTop: 10 }]}>Promo Code</Text>
              <Text>{promoCode} - {discount.toLocaleString()} VND</Text>
            </>
          ) : null}
          <Text style={[styles.previewHeader, { marginTop: 10 }]}>Cost</Text>
          <View style={styles.previewRow}><Text>Subtotal:</Text><Text>{subtotal.toLocaleString()} VND</Text></View>
          <View style={styles.previewRow}><Text>Shipping:</Text><Text>{shippingPrice.toLocaleString()} VND</Text></View>
          {discount > 0 && <View style={styles.previewRow}><Text>Discount:</Text><Text>-{discount.toLocaleString()} VND</Text></View>}
          <View style={[styles.previewRow, { borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 8 }]}>
            <Text style={{ fontWeight: 'bold' }}>Total:</Text>
            <Text style={{ fontWeight: 'bold' }}>{totalAmount.toLocaleString()} VND</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeOrderButtonText}>Place Order</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  inputContainer: { backgroundColor: '#F2F2F2', borderRadius: 8, height: 50, justifyContent: 'center', paddingHorizontal: 12 },
  input: { color: '#000', fontSize: 16 },
  errorText: { color: 'red', fontSize: 13, marginTop: 4, marginLeft: 5 },
  optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', padding: 15, borderRadius: 8, marginBottom: 10 },
  optionButtonSelected: { backgroundColor: '#FFF', borderColor: '#000', borderWidth: 2 },
  optionText: { fontSize: 16, marginLeft: 10 },
  promoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  promoInput: { flex: 1, backgroundColor: '#F2F2F2', borderRadius: 8, height: 50, paddingHorizontal: 12 },
  applyButton: { backgroundColor: '#555', padding: 15, borderRadius: 8, marginLeft: 10 },
  applyButtonText: { color: '#FFF', fontWeight: 'bold' },
  placeOrderButton: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  placeOrderButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cartBox: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 15, marginBottom: 20 },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cartName: { flex: 1, fontSize: 16 },
  cartQty: { width: 30, textAlign: 'center' },
  cartPrice: { width: 120, textAlign: 'right' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginVertical: 8 },
  previewBox: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 15, marginBottom: 20 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  previewHeader: { fontWeight: '600', marginBottom: 4 },
});

export default CheckoutScreen;
