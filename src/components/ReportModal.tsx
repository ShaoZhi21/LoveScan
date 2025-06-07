import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Button } from './ui/Button';
import { REPORT_REASONS, ReportReason, ReportSubmissionData } from '../types/report';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reportData: ReportSubmissionData) => Promise<void>;
  navigation?: any;
  scanData: {
    name?: string;
    imageUrl?: string;
    socialMedia?: any;
    scanType: ReportSubmissionData['scan_type'];
    riskScore?: number;
    riskLevel?: ReportSubmissionData['risk_level'];
    fullScanData?: any;
  };
}

export function ReportModal({ visible, onClose, onSubmit, navigation, scanData }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleReasonSelect = (reason: ReportReason) => {
    if (selectedReason === reason) {
      setSelectedReason('');
    } else {
      setSelectedReason(reason);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a primary reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData: ReportSubmissionData = {
        reported_name: scanData.name,
        reported_image_url: scanData.imageUrl,
        reported_social_media: scanData.socialMedia,
        scan_type: scanData.scanType,
        scan_data: scanData.fullScanData,
        risk_score: scanData.riskScore,
        risk_level: scanData.riskLevel,
        report_reason: selectedReason,
        description: description.trim() || undefined,
      };

      await onSubmit(reportData);
      
      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    // Reset form and close
    setShowSuccess(false);
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {showSuccess ? (
          // Success Screen
          <>
            <View style={styles.successHeader}>
              <View style={styles.successLogo}>
                <Text style={styles.successLogoText}>💕</Text>
              </View>
              <TouchableOpacity onPress={handleSuccessClose} style={styles.successCloseButton}>
                <Text style={styles.successCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>We have submitted a love scam report for you</Text>
              
              <View style={styles.successSteps}>
                <View style={styles.successStep}>
                  <View style={[styles.successStepIcon, styles.completedStep]}>
                    <Text style={styles.successStepIconText}>✓</Text>
                  </View>
                  <View style={styles.successStepContent}>
                    <Text style={styles.successStepText}>You and others helped flag this suspicious profile</Text>
                  </View>
                </View>
                
                <View style={styles.successStepConnector} />
                
                <View style={styles.successStep}>
                  <View style={[styles.successStepIcon, styles.activeStep]}>
                    <Text style={styles.successStepIconText}>●</Text>
                  </View>
                  <View style={styles.successStepContent}>
                    <Text style={styles.successStepText}>Awaiting review by LoveScan</Text>
                  </View>
                </View>
                
                <View style={styles.successStepConnector} />
                
                <View style={styles.successStep}>
                  <View style={[styles.successStepIcon, styles.pendingStep]}>
                    <Text style={styles.successStepIconText}>🛡️</Text>
                  </View>
                  <View style={styles.successStepContent}>
                    <Text style={styles.successStepText}>Others will be alerted to this suspicious profile</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.successFooter}>
              <Button
                title="Continue"
                onPress={handleSuccessClose}
                style={styles.successButton}
              />
            </View>
          </>
        ) : (
          // Report Form
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Report Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Report Information */}
          <View style={styles.reportInfoSection}>
            <Text style={styles.reportTitle}>Report this as a love scam?</Text>
            
            {/* Profile Summary */}
            <View style={styles.profileSummaryColumn}>
              <Text style={styles.reportingLabel}>Reporting:</Text>
              <Text style={styles.profileNameColumn}>{scanData.name || 'Unknown Profile'}</Text>
              {scanData.riskLevel && (
                <View style={[styles.riskBadgeColumn, styles[`risk${scanData.riskLevel}`]]}>
                  <Text style={styles.riskTextColumn}>{scanData.riskLevel.replace('_', ' ')} RISK</Text>
                </View>
              )}
            </View>
            
            <View style={styles.infoSteps}>
              <View style={styles.infoStep}>
                <View style={styles.stepIcon}>
                  <Text style={styles.stepIconText}>💕</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>LoveScan will review and store this information</Text>
                </View>
              </View>
              
              <View style={styles.stepConnector} />
              
              <View style={styles.infoStep}>
                <View style={styles.stepIcon}>
                  <Text style={styles.stepIconText}>📊</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>Others will be alerted to this suspicious profile</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Primary Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Reason *</Text>
            <Text style={styles.sectionSubtitle}>Select the main reason for reporting this profile</Text>
            
            <View style={styles.reasonGrid}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => handleReasonSelect(reason)}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.selectedReasonButton
                  ]}
                >
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.selectedReasonText
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
            <Text style={styles.sectionSubtitle}>Provide any additional information that might be helpful</Text>
            
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe any specific red flags, suspicious behavior, or additional context..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title={isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            style={styles.submitButton}
          />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSummary: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 8,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  riskLOW: { backgroundColor: '#28a745' },
  riskMEDIUM: { backgroundColor: '#ffc107' },
  riskHIGH: { backgroundColor: '#dc3545' },
  riskVERY_HIGH: { backgroundColor: '#721c24' },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSummaryInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  profileSummaryColumn: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  reportingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  profileNameInline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  profileNameColumn: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  riskBadgeInline: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  riskBadgeColumn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  riskTextInline: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskTextColumn: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedReasonButton: {
    backgroundColor: '#8b0000',
    borderColor: '#8b0000',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedReasonText: {
    color: '#fff',
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#8b0000',
    height: 50,
  },
  reportInfoSection: {
    paddingVertical: 24,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoSteps: {
    paddingVertical: 8,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconText: {
    fontSize: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#e9ecef',
    marginLeft: 23,
    marginVertical: 4,
  },
  // Success Screen Styles
  successHeader: {
    backgroundColor: '#8b0000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  successLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLogoText: {
    fontSize: 24,
  },
  successCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCloseButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  successContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  successSteps: {
    paddingVertical: 20,
  },
  successStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  successStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  completedStep: {
    backgroundColor: '#d4edda',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  activeStep: {
    backgroundColor: '#8b0000',
  },
  pendingStep: {
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  successStepIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  successStepContent: {
    flex: 1,
  },
  successStepText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  successStepConnector: {
    width: 3,
    height: 32,
    backgroundColor: '#dee2e6',
    marginLeft: 22,
    marginVertical: 8,
  },
  successFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  successButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
}); 