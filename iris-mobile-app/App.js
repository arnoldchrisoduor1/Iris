import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import "./global.css";

import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen from './screens/OnboardingScreen';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  
  useEffect(() => {
    // Check if it's the first launch
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
    };
    
    checkFirstLaunch();
  }, []);

  // Set has launched after onboarding completes
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.log('Error setting first launch status:', error);
    }
  };

  // Show loading or splash screen while checking onboarding status
  if (isFirstLaunch === null) {
    return null;
  }
  
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {isFirstLaunch ? (
        <OnboardingScreen onComplete={completeOnboarding} />
      ) : (
        <AppNavigator />
      )}
      <Toast />
    </NavigationContainer>
  );
}