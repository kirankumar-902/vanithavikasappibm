import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Dance Classes',
      description: 'Professional dance training and choreography',
      icon: 'musical-notes-outline',
      color: ['#FB923C', '#F97316'],
      bgColor: '#FED7AA'
    },
    {
      id: 2,
      title: 'Home Food',
      description: 'Delicious homemade meals and catering services',
      icon: 'restaurant-outline',
      color: ['#10B981', '#059669'],
      bgColor: '#D1FAE5'
    },
    {
      id: 3,
      title: 'Beauty & Mehendi',
      description: 'Beauty treatments, makeup and henna art',
      icon: 'sparkles-outline',
      color: ['#EC4899', '#DB2777'],
      bgColor: '#FCE7F3'
    },
    {
      id: 4,
      title: 'Home Tutoring',
      description: 'Quality education and skill development at home',
      icon: 'book-outline',
      color: ['#6B46C1', '#7C3AED'],
      bgColor: '#E9D5FF'
    },
    {
      id: 5,
      title: 'Handicrafts & Embroidery',
      description: 'Creative handmade items and decorative stitching',
      icon: 'color-palette-outline',
      color: ['#F59E0B', '#D97706'],
      bgColor: '#FEF3C7'
    },
    {
      id: 6,
      title: 'Home Maid Services',
      description: 'Cleaning, organizing, and household assistance',
      icon: 'home-outline',
      color: ['#3B82F6', '#2563EB'],
      bgColor: '#DBEAFE'
    }
  ];

  return (
    <View className="py-16 px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-4">
          Popular Services
        </Text>
        <Text className="text-lg text-center text-gray-600 px-4">
          Discover the most sought-after services in your community
        </Text>
      </View>

      {/* Services Grid */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        className="mb-8"
      >
        <View className="flex-row space-x-4">
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              className="w-64 rounded-2xl shadow-lg overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            >
              {/* Service Header */}
              <View 
                className="p-6 items-center"
                style={{ backgroundColor: service.bgColor }}
              >
                <View className="w-16 h-16 rounded-full items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                  <Ionicons name={service.icon} size={32} color={service.color[0]} />
                </View>
                <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                  {service.title}
                </Text>
                <Text className="text-sm text-gray-600 text-center">
                  {service.description}
                </Text>
              </View>

              {/* Service Footer */}
              <View className="p-4">
                <TouchableOpacity className="w-full py-3 rounded-xl items-center">
                  <LinearGradient
                    colors={service.color}
                    style={{
                      width: '100%',
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center'
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text className="text-white font-semibold">
                      Explore Services
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* View All Button */}
      <View className="items-center">
        <TouchableOpacity
          className="px-8 py-4 rounded-2xl border-2 items-center"
          style={{ 
            borderColor: '#FB923C', 
            backgroundColor: 'rgba(255, 255, 255, 0.8)' 
          }}
        >
          <Text className="text-lg font-semibold" style={{ color: '#FB923C' }}>
            View All Services
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Services;
