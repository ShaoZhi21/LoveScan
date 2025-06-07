import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '../components/ui/Button';

interface RiskReportScreenProps {
  navigation?: any;
}

export function RiskReportScreen({ navigation }: RiskReportScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Risk Assessment Report</Text>
        <Text style={styles.subtitle}>Analysis complete - detailed report coming soon</Text>
        <Button title="Back to Home" onPress={() => navigation?.navigate('Home')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8b0000' },
  content: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 50, borderTopRightRadius: 50, padding: 24, justifyContent: 'center', gap: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
}); 