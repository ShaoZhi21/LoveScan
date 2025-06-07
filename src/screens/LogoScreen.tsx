import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AuthService } from '../lib/authService';

interface LogoScreenProps {
  navigation?: any;
}

export function LogoScreen({ navigation }: LogoScreenProps) {
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if user is already logged in
        const session = await AuthService.getCurrentSession();
        
        setTimeout(() => {
          if (session?.user) {
            // User is logged in, go to Home
            console.log('User is logged in, navigating to Home');
            navigation?.replace('Home');
          } else {
            // No session, go to Login
            console.log('No active session, navigating to Login');
            navigation?.replace('Login');
          }
        }, 1500);
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, default to Login
        setTimeout(() => {
          navigation?.replace('Login');
        }, 1500);
      }
    };

    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/LoveScanLogoName.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Protecting Hearts, Detecting Scams</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 350,
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#8b0000',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 24,
  },
}); 