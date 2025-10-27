import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Import the auth hook

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register } = useAuth(); // Get the register function from context

  const handleSubmit = async () => {
    // Call the register function
    const success = await register(form.name, form.email, form.password);

    if (success) {
      // If register was successful, go back to the Profile screen
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.logo}>MUSICX</Text>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// You can re-use the same styles from your original ProfileScreen
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: {
    color: '#000',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    paddingVertical: 0,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#666', textAlign: 'center', marginTop: 20 },
});

export default RegisterScreen;