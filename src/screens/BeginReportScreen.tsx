import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '../components/ui/Button';

// Placeholder screens
export function BeginReportScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Report a Scam</Text>
        <Text style={styles.subtitle}>Help us protect others by reporting scam encounters</Text>
        <Button title="Continue" onPress={() => navigation?.navigate('ScamEvidence')} />
        <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

export function ReportScamScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Report Scam</Text>
        <Button title="Back" onPress={() => navigation?.goBack()} />
      </View>
    </SafeAreaView>
  );
}

export function ScamEvidenceScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Evidence</Text>
        <Button title="Continue" onPress={() => navigation?.navigate('SubmitReport')} />
        <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

export function SubmitReportScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Submit Report</Text>
        <Button title="Submit" onPress={() => navigation?.navigate('Home')} />
        <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

export function DetailedReportScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Detailed Report</Text>
        <Button title="Back" onPress={() => navigation?.goBack()} />
      </View>
    </SafeAreaView>
  );
}

export function ReverseImageSearchScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Image Search Results</Text>
        <Text style={styles.subtitle}>Searching for similar images...</Text>
        <Button title="Back" onPress={() => navigation?.goBack()} />
      </View>
    </SafeAreaView>
  );
}

export function ScreenshotAnalysisScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Screenshot Analysis</Text>
        <Text style={styles.subtitle}>Analyzing screenshot for scam indicators...</Text>
        <Button title="View Report" onPress={() => navigation?.navigate('RiskReport')} />
        <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

export function ChatlogAnalysisScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chat Analysis</Text>
        <Text style={styles.subtitle}>Analyzing messages for suspicious patterns...</Text>
        <Button title="View Report" onPress={() => navigation?.navigate('RiskReport')} />
        <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

export function SocialMediaAnalysisScreen({ navigation }: { navigation?: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Social Media Analysis</Text>
        <Text style={styles.subtitle}>Analyzing social media profiles...</Text>
        <Button title="View Report" onPress={() => navigation?.navigate('RiskReport')} />
        <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8b0000' },
  content: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 50, 
    borderTopRightRadius: 50, 
    padding: 24, 
    justifyContent: 'center', 
    gap: 20 
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
}); 