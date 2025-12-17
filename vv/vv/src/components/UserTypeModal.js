import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const UserTypeModal = ({ visible, onClose, onSelectUserType, setShowUserTypeModal, navigation }) => {
  const handleSelectUserType = (userType) => {
    setShowUserTypeModal(false);
    navigation?.navigate('Login', { userType });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="heart" size={32} color="#FB923C" />
              </View>
              <Text style={styles.title}>Choose Your Path</Text>
              <Text style={styles.subtitle}>
                How would you like to use Vanitha Vikas?
              </Text>
            </View>

            {/* User Type Options */}
            <View style={styles.optionsContainer}>
              {/* Need a Service */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => onSelectUserType('user')}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="search" size={32} color="#FB923C" />
                  </View>
                  <Text style={styles.optionTitle}>I Need a Service</Text>
                  <Text style={styles.optionDescription}>
                    Find skilled women service providers in your area
                  </Text>
                  <View style={styles.features}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>Browse services</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>Chat with providers</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>Book services</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Provide Services */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => onSelectUserType('provider')}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="briefcase" size={32} color="#6B46C1" />
                  </View>
                  <Text style={styles.optionTitle}>I Provide Services</Text>
                  <Text style={styles.optionDescription}>
                    Showcase your skills and grow your business
                  </Text>
                  <View style={styles.features}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>Create service listings</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>Manage bookings</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>Earn income</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                You can always change this later in your profile settings
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  features: {
    alignItems: 'flex-start',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default UserTypeModal;
