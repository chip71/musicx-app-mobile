import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Alert, // Make sure Alert is imported
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// ... (CartItem component remains the same)
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <View style={styles.itemContainer}>
    <Image source={{ uri: item.image }} style={styles.itemImage} />
    <View style={styles.itemDetails}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemPrice}>
        {item.pricePerUnit.toLocaleString()} VND
      </Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
          <Ionicons name="remove" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
    <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
      <Ionicons name="trash-outline" size={24} color="#FF3B30" />
    </TouchableOpacity>
  </View>
);


const CartScreen = ({ navigation }) => {
  const { user, cart, addToCart, decrementItem, removeFromCart } = useAuth();

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Please Log In',
        'You must be logged in to proceed to checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Profile') },
        ]
      );
    } else {
      navigation.navigate('Checkout');
    }
  };

  // ... (Empty cart view remains the same)
  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Navbar showSearch={false} />
        <View style={styles.center}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar showSearch={false} />
      <FlatList
        data={cart}
        keyExtractor={(item) => item.albumId}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrease={() => addToCart(item)}
            onDecrease={() => decrementItem(item.albumId)}
            onRemove={() => removeFromCart(item.albumId)}
          />
        )}
        ListHeaderComponent={<Text style={styles.title}>My Cart</Text>}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString()} VND
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleCheckout}>
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        {/* ✅ 1. ADD THIS CONDITIONAL MESSAGE */}
        {!user && (
          <Text style={styles.loginPrompt}>
            You must log in to check out.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#888', marginTop: 10 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#888', marginBottom: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  quantityText: { fontSize: 16, marginHorizontal: 15, fontWeight: '600' },
  removeButton: { padding: 10 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 20,
    backgroundColor: '#FFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: { fontSize: 18, color: '#666' },
  totalAmount: { fontSize: 22, fontWeight: 'bold' },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  // ✅ 2. ADD THIS STYLE
  loginPrompt: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default CartScreen;