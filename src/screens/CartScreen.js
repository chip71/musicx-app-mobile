import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  // Đảm bảo Alert được import
  Alert, 
} from 'react-native';
// Chú ý: Dùng Ionicons từ 'react-native-vector-icons/Ionicons'
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Component đại diện cho một sản phẩm trong giỏ hàng
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

  // Hàm xử lý khi nhấn "Proceed to Checkout"
  const handleCheckout = () => {
    if (!user) {
      // Dùng Alert hoặc điều hướng trực tiếp tùy theo cách bạn muốn thông báo
      // Tùy chọn 1: Hiển thị Alert (như code gốc của bạn)
      Alert.alert(
        'Please Log In',
        'You must be logged in to proceed to checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          // Chuyển hướng đến Tab Profile, sau đó đến màn hình Login
          { text: 'Log In', onPress: () => navigation.navigate('Profile', { screen: 'Login' }) },
        ]
      );
      
      // Tùy chọn 2 (Nếu muốn điều hướng thẳng):
      // navigation.navigate('Profile', { screen: 'Login' });

    } else {
      // Đã đăng nhập
      navigation.navigate('Checkout');
    }
  };
  
  // Hàm xử lý khi nhấn "Sign In Now" (Nút mới)
  const handleSignIn = () => {
    navigation.navigate('Profile', { screen: 'Login' });
  };


  // Hiển thị giỏ hàng trống
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

  // Hiển thị giỏ hàng
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
      
      {/* CẬP NHẬT FOOTER: Nút Checkout luôn hiện + Nút Sign In Now hiện khi chưa đăng nhập */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString()} VND
          </Text>
        </View>

        {/* Nút Checkout luôn hiển thị và nhấn được */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCheckout} // Luôn gọi handleCheckout để kiểm tra đăng nhập
        >
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </TouchableOpacity>

        {/* Nút Sign In Now chỉ hiển thị khi chưa đăng nhập */}
        {!user && (
          <TouchableOpacity 
            style={[styles.button, styles.signInButton]} // Thêm style phụ để phân biệt
            onPress={handleSignIn}
          >
            <Text style={[styles.buttonText, styles.signInButtonText]}>Sign In Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- STYLESHEET ---
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
    marginBottom: 10, // Thêm khoảng cách dưới cho nút Checkout
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  // Style mới cho nút Sign In Now
  signInButton: {
    backgroundColor: '#FFF', // Nền trắng
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 0, // Bỏ khoảng cách mặc định
    marginBottom: 0, // Bỏ khoảng cách mặc định
  },
  signInButtonText: {
    color: '#000', // Chữ đen
  }
});

export default CartScreen;