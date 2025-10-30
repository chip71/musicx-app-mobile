// src/screens/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  // --- 1. LOGGED IN VIEW ---
  if (user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.profileContainer}>
          <Text style={styles.logoSmall}>MUSICX</Text>
          <Text style={styles.welcomeTitle}>👋 Welcome,</Text>
          <Text style={styles.welcomeName}>{user.name}</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          {/* View Order History Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="receipt-outline" size={20} color="#333" style={styles.buttonIcon} />
            <Text style={styles.profileButtonText}>View Order History</Text>
          </TouchableOpacity>

          {/* ✅ Edit Profile Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('EditProfile')} // Navigate to new screen
          >
            <Ionicons name="pencil-outline" size={20} color="#333" style={styles.buttonIcon} />
            <Text style={styles.profileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* ✅ Change Password Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ChangePassword')} // Navigate to new screen
          >
            <Ionicons name="lock-closed-outline" size={20} color="#333" style={styles.buttonIcon} />
            <Text style={styles.profileButtonText}>Change Password</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.profileButton, styles.logoutButton]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={styles.buttonIcon} />
            <Text style={[styles.profileButtonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- 2. LOGGED OUT VIEW ---
  // ... (remains the same) ...
   return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.logo}>MUSICX</Text>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.promptText}>
          Please sign in or create an account to view your profile, orders.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.buttonText, styles.registerButtonText]}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  // Logged Out Styles
  authContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { color: '#000', fontSize: 40, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 15, textAlign: 'center', color: '#333' },
  promptText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  registerButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#000' },
  registerButtonText: { color: '#000' },
  // Logged In Styles
  profileContainer: { flex: 1, padding: 24 },
  logoSmall: { color: '#000', fontSize: 28, fontWeight: '900', marginBottom: 20 },
  welcomeTitle: { fontSize: 26, fontWeight: '600', color: '#333' },
  welcomeName: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  emailText: { fontSize: 16, color: '#666', marginBottom: 40 },
  profileButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 15 },
  buttonIcon: { marginRight: 12 },
  profileButtonText: { fontSize: 16, fontWeight: '500', color: '#333' },
  logoutButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#FF3B30', paddingVertical: 12.5, paddingHorizontal: 14.5, marginTop: 10 }, // Added margin top
  logoutButtonText: { color: '#FF3B30', fontWeight: '600' },
});

export default ProfileScreen;