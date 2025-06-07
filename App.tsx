import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from './src/lib/authService';

// Import screens
import { LogoScreen } from './src/screens/LogoScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CheckPreviewScreen } from './src/screens/CheckPreviewScreen';
import { CheckMainScreen } from './src/screens/CheckMainScreen';
import { SubmitScamReportMain } from './src/screens/SubmitScamReportMain';
import { ScamReportSuccessScreen } from './src/screens/ScamReportSuccessScreen';
import PreviousReportsScreen from './src/screens/PreviousReportsScreen';
import { ChatScanScreen } from './src/screens/ChatScanScreen';
import { ProfileScanScreen } from './src/screens/ProfileScanScreen';
import { SocialMediaScanScreen } from './src/screens/SocialMediaScanScreen';
import { ScanningProgressScreen } from './src/screens/ScanningProgressScreen';
import { ScanSummaryResultsScreen } from './src/screens/ScanSummaryResultsScreen';
import { ChatAnalysisResultsScreen } from './src/screens/ChatAnalysisResultsScreen';
import { SocialMediaAnalysisResultsScreen } from './src/screens/SocialMediaAnalysisResultsScreen';
import { RiskReportScreen } from './src/screens/RiskReportScreen';
import { ReverseImageSearchScreen } from './src/screens/ReverseImageSearchScreen';
import { 
  BeginReportScreen,
  ReportScamScreen,
  ScamEvidenceScreen,
  SubmitReportScreen,
  DetailedReportScreen,
  ScreenshotAnalysisScreen,
  ChatlogAnalysisScreen,
  SocialMediaAnalysisScreen
} from './src/screens/BeginReportScreen';

type ScreenName = 
  | 'Logo'
  | 'Login' 
  | 'Signup'
  | 'Home'
  | 'CheckPreview'
  | 'CheckMain'
  | 'SubmitScamReportMain' 
  | 'ScamReportSuccess'
  | 'PreviousReports'
  | 'ChatScan'
  | 'ProfileScan'
  | 'SocialMediaScan'
  | 'RiskReport'
  | 'BeginReport'
  | 'ReportScam'
  | 'ScamEvidence'
  | 'SubmitReport'
  | 'DetailedReport'
  | 'ReverseImageSearch'
  | 'ScreenshotAnalysis'
  | 'ChatlogAnalysis'
  | 'SocialMediaAnalysis'
  | 'ScanningProgress'
  | 'ScanSummaryResults'
  | 'ChatAnalysisResults'
  | 'SocialMediaAnalysisResults';

interface RouteParams {
  [key: string]: any;
}

interface ScreenState {
  name: ScreenName;
  params?: RouteParams;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>({ name: 'Logo' });
  const [screenStack, setScreenStack] = useState<ScreenState[]>([{ name: 'Logo' }]);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        // User signed out, go to login
        setCurrentScreen({ name: 'Login' });
        setScreenStack([{ name: 'Login' }]);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, go to home if currently on auth screens
        if (currentScreen.name === 'Login' || currentScreen.name === 'Signup') {
          setCurrentScreen({ name: 'Home' });
          setScreenStack([{ name: 'Home' }]);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentScreen.name]);

  const navigate = (screenName: ScreenName, params?: RouteParams) => {
    console.log(`App: Navigating to ${screenName} with params:`, params);
    
    // If we're navigating to a screen that's already in the stack, merge parameters
    const existingIndex = screenStack.findIndex(screen => screen.name === screenName);
    let finalParams = params;
    
    if (existingIndex !== -1) {
      // Merge new parameters with existing ones
      const existingParams = screenStack[existingIndex].params || {};
      finalParams = { ...existingParams, ...params };
      console.log(`App: Merging params for ${screenName}. Existing:`, existingParams, 'New:', params, 'Final:', finalParams);
    }
    
    const newScreen = { name: screenName, params: finalParams };
    setCurrentScreen(newScreen);
    
    if (existingIndex !== -1) {
      // Update the existing screen with merged parameters
      const newStack = [...screenStack];
      newStack[existingIndex] = newScreen;
      setScreenStack(newStack.slice(0, existingIndex + 1));
    } else {
      // Add new screen to stack
      setScreenStack(prev => [...prev, newScreen]);
    }
  };

  const goBack = () => {
    if (screenStack.length > 1) {
      const newStack = screenStack.slice(0, -1);
      setScreenStack(newStack);
      setCurrentScreen(newStack[newStack.length - 1]);
    }
  };

  const replace = (screenName: ScreenName, params?: RouteParams) => {
    const newScreen = { name: screenName, params };
    setCurrentScreen(newScreen);
    setScreenStack(prev => [...prev.slice(0, -1), newScreen]);
  };

  const navigationProps = {
    navigate,
    goBack,
    replace,
  };

  const route = {
    params: currentScreen.params,
  };

  console.log('App: Current screen:', currentScreen.name, 'with params:', currentScreen.params);

  const renderScreen = () => {
    const props = { navigation: navigationProps, route };
    
    switch (currentScreen.name) {
      case 'Logo':
        return <LogoScreen navigation={navigationProps} />;
      case 'Login':
        return <LoginScreen navigation={navigationProps} />;
      case 'Signup':
        return <SignupScreen navigation={navigationProps} />;
      case 'Home':
        return <HomeScreen navigation={navigationProps} />;
      case 'CheckPreview':
        return <CheckPreviewScreen navigation={navigationProps} />;
      case 'CheckMain':
        return <CheckMainScreen {...props} />;
      case 'SubmitScamReportMain':
        return <SubmitScamReportMain {...props} />;
      case 'ScamReportSuccess':
        return <ScamReportSuccessScreen navigation={navigationProps} />;
      case 'PreviousReports':
        return <PreviousReportsScreen navigation={navigationProps} />;
      case 'ChatScan':
        return <ChatScanScreen {...props} />;
      case 'ProfileScan':
        return <ProfileScanScreen {...props} />;
      case 'SocialMediaScan':
        return <SocialMediaScanScreen {...props} />;
      case 'RiskReport':
        return <RiskReportScreen navigation={navigationProps} />;
      case 'BeginReport':
        return <BeginReportScreen navigation={navigationProps} />;
      case 'ReportScam':
        return <ReportScamScreen navigation={navigationProps} />;
      case 'ScamEvidence':
        return <ScamEvidenceScreen navigation={navigationProps} />;
      case 'SubmitReport':
        return <SubmitReportScreen navigation={navigationProps} />;
      case 'DetailedReport':
        return <DetailedReportScreen navigation={navigationProps} />;
      case 'ReverseImageSearch':
        return <ReverseImageSearchScreen navigation={navigationProps} route={route as any} />;
      case 'ScreenshotAnalysis':
        return <ScreenshotAnalysisScreen navigation={navigationProps} />;
      case 'ChatlogAnalysis':
        return <ChatlogAnalysisScreen navigation={navigationProps} />;
      case 'SocialMediaAnalysis':
        return <SocialMediaAnalysisScreen navigation={navigationProps} />;
      case 'ScanningProgress':
        return <ScanningProgressScreen {...props as any} />;
      case 'ScanSummaryResults':
        return <ScanSummaryResultsScreen {...props as any} />;
      case 'ChatAnalysisResults':
        return <ChatAnalysisResultsScreen {...props as any} />;
      case 'SocialMediaAnalysisResults':
        return <SocialMediaAnalysisResultsScreen {...props as any} />;
      default:
        return <LogoScreen navigation={navigationProps} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
