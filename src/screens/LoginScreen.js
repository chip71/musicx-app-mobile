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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  // const { login } = useAuth();
  const { login, user } = useAuth();

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      if (!value.trim()) error = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Please enter a valid email.';
    }
    if (field === 'password') {
      if (!value.trim()) error = 'Password is required.';
      else if (value.length < 6) error = 'Password must be at least 6 characters.';
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setLoginError(''); // clear any previous login error
  };

  const validateAll = () => {
    validateField('email', form.email);
    validateField('password', form.password);
    return !errors.email && !errors.password && form.email && form.password;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      setLoginError('Please check your email and password.');
      return;
    }

    setLoading(true);
    const success = await login(form.email, form.password);
    setLoading(false);

    if (success) {
      setLoginError('');

      // 👇 redirect based on role
      setTimeout(() => {
        if (user?.role === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          if (user && user.role === 'admin') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminDashboard' }],
            });
          } else if (user) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeTabs' }],
            });
          } else {
            console.warn('No user data found after login.');
          }


        }
      }, 200);
    } else {
      setLoginError('Invalid email or password.');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.logo}>MUSICX</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

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

        {/* --- Login Error --- */}
        {loginError ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.loginError}>{loginError}</Text>
          </Animated.View>
        ) : null}

        {/* --- Sign In Button --- */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#333' }]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* --- Link to Register --- */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            No account? <Text style={styles.linkHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: {
    color: '#000',
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 30,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
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
  loginError: {
    color: '#D8000C',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#FFD2D2',
    padding: 6,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 15,
  },
  linkHighlight: {
    color: '#000',
    fontWeight: '600',
  },
});

export default LoginScreen;
