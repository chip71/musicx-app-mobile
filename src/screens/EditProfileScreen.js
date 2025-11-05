// src/screens/EditProfileScreen.js
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
import { useAuth } from '../context/AuthContext'; 

// --- API URL SETUP ---
const API_URL = "https://musicx-mobile-backend.onrender.com";
console.log("🔗 Using API:", API_URL);


const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    if (!user?._id) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
    }

    setIsLoading(true);
    try {
      // --- Backend Call ---
      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        { 
          name: name.trim(),
          // ✅ FIX: Include the userId in the request body
          userId: user._id 
        }
      );

      // --- Update Local State ---
      if (setUser) { 
         // Update user context with the name returned from backend
         setUser({ ...user, name: response.data.name }); 
      }

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack(); 

    } catch (err) {
      console.error('Update profile error:', err);
      // Retrieve the specific error message from the backend
      const message = err.response?.data?.message || 'Could not update profile.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Display Email (usually not editable) */}
        <View style={[styles.inputContainer, styles.disabledInput]}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.input}>{user?.email || 'No email found'}</Text>
        </View>

        <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
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
  disabledInput: { backgroundColor: '#E5E5E5' }, // Style for non-editable fields
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A0A0A0' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default EditProfileScreen;