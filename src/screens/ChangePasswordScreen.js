import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:9999'
  : Platform.OS === 'web' ? 'http://localhost:9999'
  : 'http://192.168.137.1:9999';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // success/error

  // --- Password Strength Validation ---
  const isStrongPassword = (password) => {
    return (
      /[A-Z]/.test(password) && // Uppercase
      /[a-z]/.test(password) && // Lowercase
      /[0-9]/.test(password) && // Number
      /[!@#$%^&*(),.?":{}|<>]/.test(password) && // Special char
      password.length >= 8
    );
  };

  const handleChangePassword = async () => {
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = 'Enter your current password.';
    if (!newPassword) newErrors.newPassword = 'Enter your new password.';
    else if (!isStrongPassword(newPassword))
      newErrors.newPassword =
        'Password must have at least 8 chars, uppercase, number & special symbol.';
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!user?._id) {
      setMessage({ text: 'User not found. Please log in again.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.put(`${API_URL}/api/users/password`, {
        userId: user._id,
        currentPassword,
        newPassword,
      });

      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => navigation.goBack(), 1200);
    } catch (err) {
      console.error('Change password error:', err);
      setMessage({
        text: err.response?.data?.message || 'Could not change password.',
        type: 'error',
      });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Secure your account</Text>

        {/* Current Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Current Password"
            placeholderTextColor="#888"
            secureTextEntry={!showCurrent}
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons
              name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errors.currentPassword && (
          <Text style={styles.errorText}>{errors.currentPassword}</Text>
        )}

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#888"
            secureTextEntry={!showNew}
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirm}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons
              name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        {/* Animated message */}
        {message.text ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text
              style={[
                styles.message,
                message.type === 'success' ? styles.successMsg : styles.errorMsg,
              ]}
            >
              {message.text}
            </Text>
          </Animated.View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, isLoading && { backgroundColor: '#333' }]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 50,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#000', fontSize: 16 },
  errorText: {
    color: '#D8000C',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  message: {
    textAlign: 'center',
    marginVertical: 10,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  successMsg: {
    color: '#155724',
    backgroundColor: '#D4EDDA',
  },
  errorMsg: {
    color: '#721C24',
    backgroundColor: '#F8D7DA',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default ChangePasswordScreen;
