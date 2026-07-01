import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/database/firebaseConfig';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleLogin = async () => {
    if (!phone || !pin) {
      Alert.alert('Error', 'Please enter both phone number and PIN');
      return;
    }

    setIsLoggingIn(true);
    try {
      const email = `${phone.trim()}@autotrack.local`;
      await signInWithEmailAndPassword(auth, email, pin);
      // Let AuthContext redirect naturally
    } catch (error: any) {
      Alert.alert('Login Failed', 'Invalid phone number or PIN');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AutoTrack</Text>
      <Text style={styles.subtitle}>Enter your phone number and PIN to log in.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="e.g. 08012345678"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PIN</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          placeholder="******"
          maxLength={6}
        />

        <TouchableOpacity 
          style={[styles.button, isLoggingIn && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 24,
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#8bc0d4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  }
});
