import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all screens
import { LogoScreen } from '../screens/LogoScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CheckPreviewScreen } from '../screens/CheckPreviewScreen';
import { CheckMainScreen } from '../screens/CheckMainScreen';
import { SubmitScamReportMain } from '../screens/SubmitScamReportMain';
import { ChatScanScreen } from '../screens/ChatScanScreen';
import { ProfileScanScreen } from '../screens/ProfileScanScreen';
import { SocialMediaScanScreen } from '../screens/SocialMediaScanScreen';
import { RiskReportScreen } from '../screens/RiskReportScreen';
import { BeginReportScreen } from '../screens/BeginReportScreen';
import { ReverseImageSearchScreen } from '../screens/ReverseImageSearchScreen';
import { ScanSummaryResultsScreen } from '../screens/ScanSummaryResultsScreen';
import { ScanningProgressScreen } from '../screens/ScanningProgressScreen';
import { ChatAnalysisResultsScreen } from '../screens/ChatAnalysisResultsScreen';
import { SocialMediaAnalysisResultsScreen } from '../screens/SocialMediaAnalysisResultsScreen';

export type RootStackParamList = {
  Logo: undefined;
  Login: undefined;
  Signup: undefined;
  HomeScreen: undefined;
  CheckPreview: undefined;
  CheckMain: undefined;
  SubmitScamReportMain: undefined;
  ChatScan: undefined;
  ProfileScan: undefined;
  SocialMediaScan: undefined;
  RiskReport: undefined;
  BeginReport: undefined;
  ReverseImageSearch: undefined;
  ScanSummaryResults: undefined;
  ScanningProgress: undefined;
  ChatAnalysisResults: undefined;
  SocialMediaAnalysisResults: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Logo"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Logo" component={LogoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CheckPreview" component={CheckPreviewScreen} />
        <Stack.Screen name="CheckMain" component={CheckMainScreen} />
        <Stack.Screen name="SubmitScamReportMain" component={SubmitScamReportMain} />
        <Stack.Screen name="ChatScan" component={ChatScanScreen} />
        <Stack.Screen name="ProfileScan" component={ProfileScanScreen} />
        <Stack.Screen name="SocialMediaScan" component={SocialMediaScanScreen} />
        <Stack.Screen name="RiskReport" component={RiskReportScreen} />
        <Stack.Screen name="BeginReport" component={BeginReportScreen} />
        <Stack.Screen name="ReverseImageSearch" component={ReverseImageSearchScreen} />
        <Stack.Screen name="ScanSummaryResults" component={ScanSummaryResultsScreen} />
        <Stack.Screen name="ScanningProgress" component={ScanningProgressScreen} />
        <Stack.Screen name="ChatAnalysisResults" component={ChatAnalysisResultsScreen} />
        <Stack.Screen name="SocialMediaAnalysisResults" component={SocialMediaAnalysisResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 