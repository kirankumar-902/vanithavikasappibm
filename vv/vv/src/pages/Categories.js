import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const Categories = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCategories();
      
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Dance': 'musical-notes-outline',
      'Home Tutoring': 'book-outline',
      'Home Maid': 'home-outline',
      'Tailoring': 'cut-outline',
      'Home Food': 'restaurant-outline',
      'Embroidery': 'flower-outline',
      'Beauty': 'sparkles-outline',
      'Mehendi': 'hand-left-outline',
      'Yoga & Fitness': 'fitness-outline',
      'Childcare': 'happy-outline',
      'Handicrafts': 'color-palette-outline',
      'Event Decoration': 'balloon-outline',
      'Hair Styling': 'cut-outline',
      'Baking': 'cafe-outline',
      'Music Lessons': 'musical-note-outline',
    };
    return iconMap[categoryName] || 'construct-outline';
  };

  const getCategoryGradient = (index) => {
    const gradients = [
      ['#FB923C', '#F97316'],
      ['#6B46C1', '#8B5CF6'],
      ['#EC4899', '#F472B6'],
      ['#10B981', '#34D399'],
      ['#3B82F6', '#60A5FA'],
      ['#F59E0B', '#FBBF24'],
      ['#EF4444', '#F87171'],
      ['#8B5CF6', '#A78BFA'],
    ];
    return gradients[index % gradients.length];
  };

  const renderCategoryCard = ({ item, index }) => (
    <View style={styles.categoryCard}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.categoryGradient}
      >
        <View style={styles.categoryIcon}>
          <LinearGradient
            colors={getCategoryGradient(index)}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={getCategoryIcon(item.name)} size={28} color="white" />
          </LinearGradient>
        </View>
        
        <View style={styles.categoryContent}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDescription} numberOfLines={3}>
            {item.description || `Professional ${item.name.toLowerCase()} category`}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Explore our wide range of service categories
          </Text>
        </View>

        {/* Categories Grid */}
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="grid-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Categories Found</Text>
              <Text style={styles.emptyText}>
                Categories will appear here once they are available
              </Text>
            </View>
          }
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  subtitleContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  categoryGradient: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 140,
  },
  categoryIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default Categories;
