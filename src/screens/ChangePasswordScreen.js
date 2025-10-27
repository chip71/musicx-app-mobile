// src/screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Need user for ID

// --- API URL SETUP ---
const API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:9999'
  : Platform.OS === 'web' ? 'http://localhost:9999'
  : 'http://192.168.137.1:9999'; // Ensure this IP is correct

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    // --- Input Validations ---
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) { // Example minimum length
        Alert.alert('Error', 'New password must be at least 6 characters long.');
        return;
    }
    if (!user?._id) { // Check if user object and _id exist
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
    }
    // --- End Validations ---

    setIsLoading(true);
    try {
      // --- Backend Call ---
      await axios.put(
        `${API_URL}/api/users/password`, // Endpoint for changing password
        {
          currentPassword: currentPassword,
          newPassword: newPassword,
          // ✅ ADDED: Send userId in the body (TEMPORARY FIX)
          userId: user._id
        }
        // No headers needed for this temporary fix
      );

      Alert.alert('Success', 'Password updated successfully!');
      // Clear fields after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.goBack(); // Go back to the main profile screen

    } catch (err) {
      console.error('Change password error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Could not change password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Change Password</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Current Password"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Saving...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 30, color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#000', fontSize: 16, paddingVertical: 0 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A0A0A0' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default ChangePasswordScreen;