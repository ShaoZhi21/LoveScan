import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { AuthService } from '../lib/authService';

interface LoginScreenProps {
  navigation?: any;
  route?: {
    params?: {
      email?: string;
    };
  };
}

export function LoginScreen({ navigation, route }: LoginScreenProps) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Clear any previous error
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    const result = await AuthService.signIn(email, password);
    
    if (result.error) {
      // Handle specific error cases and set inline error messages
      if (result.error.includes('Invalid login credentials') || result.error.includes('Invalid credentials')) {
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
      } else if (result.error.includes('Email not confirmed') || result.error.includes('not confirmed')) {
        setErrorMessage('Please check your email and click the confirmation link before signing in.');
      } else if (result.error.includes('Too many requests')) {
        setErrorMessage('Too many login attempts. Please wait a moment and try again.');
      } else if (result.error.includes('Network')) {
        setErrorMessage('Please check your internet connection and try again.');
      } else {
        setErrorMessage(result.error);
      }
    } else if (result.user) {
      console.log('Login successful:', result.user.email);
      navigation?.navigate('Home');
    }
    
    setIsLoading(false);
  };

  const handleSignup = () => {
    navigation?.navigate('Signup');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) setErrorMessage(''); // Clear error when user starts typing
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMessage) setErrorMessage(''); // Clear error when user starts typing
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/images/LoveScanLogoName.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Button
              title={isLoading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 300,
    height: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8b0000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#8b0000',
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: '#8b0000',
    borderRadius: 8,
  },
  signupButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    fontWeight: '600',
    color: '#8b0000',
  },
}); 