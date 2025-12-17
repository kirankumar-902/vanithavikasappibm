import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen = ({ 
  message = 'Loading...', 
  icon = null, 
  showIcon = true,
  backgroundColor = ['#FED7AA', '#F3E8FF', '#FCE7F3'],
  size = 'large',
  color = '#FB923C'
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundColor}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          {showIcon && (
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FB923C', '#6B46C1']}
                style={styles.iconGradient}
              >
                <Ionicons 
                  name={icon || "hourglass-outline"} 
                  size={32} 
                  color="white" 
                />
              </LinearGradient>
            </View>
          )}
          
          <ActivityIndicator 
            size={size} 
            color={color} 
            style={styles.spinner}
          />
          
          <Text style={styles.loadingText}>{message}</Text>
          
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const SkeletonLoader = ({ type = 'list' }) => {
  const renderListSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <LinearGradient
            colors={['#F3F4F6', '#E5E7EB', '#F3F4F6']}
            style={styles.skeletonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonTextContainer}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSubtitle} />
                <View style={styles.skeletonDescription} />
              </View>
            </View>
          </LinearGradient>
        </View>
      ))}
    </View>
  );

  const renderProfileSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonProfileCard}>
        <LinearGradient
          colors={['#F3F4F6', '#E5E7EB', '#F3F4F6']}
          style={styles.skeletonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.skeletonProfileContent}>
            <View style={styles.skeletonProfileAvatar} />
            <View style={styles.skeletonProfileName} />
            <View style={styles.skeletonProfileEmail} />
          </View>
        </LinearGradient>
      </View>
      
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonDetailCard}>
          <LinearGradient
            colors={['#F3F4F6', '#E5E7EB', '#F3F4F6']}
            style={styles.skeletonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.skeletonDetailContent}>
              <View style={styles.skeletonDetailTitle} />
              <View style={styles.skeletonDetailValue} />
            </View>
          </LinearGradient>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {type === 'list' ? renderListSkeleton() : renderProfileSkeleton()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FB923C',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  // Skeleton Styles
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  skeletonGradient: {
    padding: 16,
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 6,
    width: '50%',
  },
  skeletonDescription: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    width: '90%',
  },
  // Profile Skeleton
  skeletonProfileCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  skeletonProfileContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  skeletonProfileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1D5DB',
    marginBottom: 16,
  },
  skeletonProfileName: {
    height: 20,
    backgroundColor: '#D1D5DB',
    borderRadius: 10,
    width: 150,
    marginBottom: 8,
  },
  skeletonProfileEmail: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    width: 120,
  },
  skeletonDetailCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  skeletonDetailContent: {
    paddingVertical: 16,
  },
  skeletonDetailTitle: {
    height: 14,
    backgroundColor: '#D1D5DB',
    borderRadius: 7,
    width: '40%',
    marginBottom: 8,
  },
  skeletonDetailValue: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: '80%',
  },
});

export { LoadingScreen, SkeletonLoader };
export default LoadingScreen;
