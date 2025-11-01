import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;
const YOUR_COMPUTER_IP = '192.168.137.1';
const PORT = 9999;

const API_URL =
  Platform.OS === 'android'
    ? `http://10.0.2.2:${PORT}`
    : `http://${YOUR_COMPUTER_IP}:${PORT}`;

const AdminDashboardScreen = ({ navigation }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('week');
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0 });
  const { logout } = useAuth();

  // 🧭 Fetch chart + stats
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [revRes, statRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/revenue?range=${range}`),
        axios.get(`${API_URL}/api/admin/stats`),
      ]);
      setRevenueData(revRes.data || []);
      setStats(statRes.data || {});
    } catch (err) {
      console.error('Dashboard Fetch Error:', err.message);
      if (err.code === 'ERR_NETWORK') {
        Alert.alert(
          'Connection Error',
          `Cannot connect to server at ${API_URL}. \n\n1️⃣ Check if backend is running.\n2️⃣ Verify your IP (${YOUR_COMPUTER_IP}).`
        );
      } else {
        Alert.alert('Error', 'Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  // 📊 Chart data
  const chartData = {
    labels: revenueData.map((r) => r.label),
    datasets: [
      {
        data: revenueData.map((r) => r.amount),
        strokeWidth: 3,
        color: () => '#444', // xám đậm
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(80,80,80,${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '1.5',
      stroke: '#555',
    },
    propsForBackgroundLines: {
      stroke: '#e5e5e5',
    },
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>

        {/* 💎 Overview Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.card, { backgroundColor: '#f0f0f0' }]}>
            <Ionicons name="cash-outline" size={22} color="#333" />
            <Text style={[styles.cardValue, { color: '#007AFF' }]}>
              {stats.totalRevenue?.toLocaleString() || 0}₫
            </Text>
            <Text style={styles.cardLabel}>Total Revenue</Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#f0f0f0' }]}>
            <Ionicons name="cart-outline" size={22} color="#333" />
            <Text style={[styles.cardValue, { color: '#FF9500' }]}>
              {stats.totalOrders || 0}
            </Text>
            <Text style={styles.cardLabel}>Total Orders</Text>
          </View>

          <View style={[styles.card, { backgroundColor: '#f0f0f0' }]}>
            <Ionicons name="people-outline" size={22} color="#333" />
            <Text style={[styles.cardValue, { color: '#34C759' }]}>
              {stats.totalUsers || 0}
            </Text>
            <Text style={styles.cardLabel}>Users</Text>
          </View>
        </View>

        {/* 🔁 Range Selector */}
        <View style={styles.rangeContainer}>
          {['day', 'week', 'month'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeButton, range === r && styles.activeRange]}
              onPress={() => setRange(r)}
            >
              <Text
                style={[styles.rangeText, range === r && styles.activeRangeText]}
              >
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 📈 Revenue Chart */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#444" />
          </View>
        ) : revenueData.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 30}
            height={250}
            yAxisSuffix="₫"
            fromZero={true} // ✅ Bắt đầu từ 0₫
            segments={5} // ✅ Chia đều 5 mốc
            formatYLabel={(y) => {
              const value = Number(y);
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
              return value.toString();
            }}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={{ textAlign: 'center', color: 'gray' }}>
            No revenue data available
          </Text>
        )}

        {/* 🧩 Management Section */}
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageAlbums')}
          >
            <Ionicons name="albums" size={22} color="#000" />
            <Text style={styles.actionText}>Manage Albums</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageGenres')}
          >
            <Ionicons name="list-circle" size={22} color="#000" />
            <Text style={styles.actionText}>Manage Genres</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageOrders')}
          >
            <Ionicons name="cart-outline" size={22} color="#000" />
            <Text style={styles.actionText}>Manage Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ManageUsers')}
          >
            <Ionicons name="person-circle-outline" size={22} color="#000" />
            <Text style={styles.actionText}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        {/* 🚪 Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

// 💅 Styles
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 13,
    color: '#555',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  activeRange: { backgroundColor: '#333' },
  rangeText: { color: '#000', fontWeight: '600' },
  activeRangeText: { color: '#fff' },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginBottom: 8,
  },
  actions: { marginTop: 8 },
  actionButton: {
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionText: {
    color: '#000',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  centered: { justifyContent: 'center', alignItems: 'center', height: 200 },
});
