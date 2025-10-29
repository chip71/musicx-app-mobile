import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  // --- Field validation ---
  const validateField = (field, value) => {
    let error = '';

    if (field === 'name') {
      if (!value.trim()) error = 'Full name is required.';
      else if (value.length < 3) error = 'Name must be at least 3 characters.';
    }

    if (field === 'email') {
      if (!value.trim()) error = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Enter a valid email address.';
    }

    if (field === 'password') {
      if (!value.trim()) error = 'Password is required.';
      else if (value.length < 8)
        error = 'Password must be at least 8 characters.';
      else if (!/[A-Z]/.test(value))
        error = 'Password must include an uppercase letter.';
      else if (!/[a-z]/.test(value))
        error = 'Password must include a lowercase letter.';
      else if (!/[0-9]/.test(value))
        error = 'Password must include a number.';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
        error = 'Password must include a special character.';
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateAll = () => {
    const fields = ['name', 'email', 'password'];
    fields.forEach((f) => validateField(f, form[f]));
    return Object.values(errors).every((e) => !e);
  };

  const handleSubmit = async () => {
    const isValid = validateAll();
    if (!isValid) {
      Alert.alert('⚠️ Validation Error', 'Please fix the highlighted fields.');
      return;
    }

    const success = await register(form.name, form.email, form.password);
    if (success) {
      Alert.alert('✅ Success', 'Account created successfully!');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.logo}>MUSICX</Text>
        <Text style={styles.title}>Create Account</Text>

        {/* --- Full Name --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={form.name}
            onChangeText={(v) => handleChange('name', v)}
          />
        </View>
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        {/* --- Email --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={form.email}
            onChangeText={(v) => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        {/* --- Password --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={form.password}
            onChangeText={(v) => handleChange('password', v)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        {/* --- Submit Button --- */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* --- Link to Login --- */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
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
    marginBottom: 8,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#000', fontSize: 16, paddingVertical: 0 },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
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
