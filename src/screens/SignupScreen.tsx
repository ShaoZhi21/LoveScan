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
  ScrollView,
  Image,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { AuthService } from '../lib/authService';

interface SignupScreenProps {
  navigation?: any;
}

export function SignupScreen({ navigation }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    const result = await AuthService.signUp(email, password, fullName);
    
    if (result.error) {
      // Handle specific error cases
      if (result.error.includes('User already registered') || result.error.includes('already been registered')) {
        Alert.alert(
          'Account Already Exists',
          'This email is already registered. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign In', 
              onPress: () => {
                // Pre-fill the email on login screen
                navigation?.navigate('Login', { email });
              }
            }
          ]
        );
      } else if (result.error.includes('Password')) {
        Alert.alert('Password Error', 'Password must be at least 6 characters long.');
      } else if (result.error.includes('email')) {
        Alert.alert('Email Error', 'Please enter a valid email address.');
      } else {
        Alert.alert('Signup Error', result.error);
      }
    } else if (result.user) {
      console.log('Signup successful:', result.user.email);
      
      // Check if email confirmation is required
      if (result.user.email_confirmed_at) {
        // Email already confirmed, can login immediately
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation?.navigate('Home') }
        ]);
      } else {
        // Email confirmation required
        Alert.alert(
          'Confirmation Required', 
          'Please check your email and click the confirmation link to activate your account.',
          [{ text: 'OK', onPress: () => navigation?.navigate('Login') }]
        );
      }
    }
    
    setIsLoading(false);
  };

  const handleLogin = () => {
    navigation?.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/images/LoveScanLogoName.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to protect yourself from scams</Text>
        </View>
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
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
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button
                title={isLoading ? 'Creating Account...' : 'Sign Up'}
                onPress={handleSignup}
                disabled={isLoading}
                style={styles.signupButton}
              />

              <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8b0000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 250,
    height: 118,
  },
  headerContent: {
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffd8df',
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginTop: 8,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  signupButton: {
    marginTop: 16,
    backgroundColor: '#8b0000',
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    fontWeight: '600',
    color: '#8b0000',
  },
}); 