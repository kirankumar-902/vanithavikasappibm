import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Customer',
      rating: 5,
      comment: 'Amazing platform! Found the perfect tailor for my wedding dress. The quality of work was exceptional.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Meera Patel',
      role: 'Service Provider',
      rating: 5,
      comment: 'This platform helped me grow my home cooking business. I now have regular customers and steady income.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Anjali Reddy',
      role: 'Customer',
      rating: 5,
      comment: 'The beauty services I received were top-notch. Professional, reliable, and affordable.',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color="#F59E0B"
      />
    ));
  };

  return (
    <View className="py-16 px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-4">
          What Our Users Say
        </Text>
        <Text className="text-lg text-center text-gray-600 px-4">
          Real stories from our community of service providers and customers
        </Text>
      </View>

      {/* Testimonials Carousel */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        className="mb-8"
      >
        <View className="flex-row space-x-4">
          {testimonials.map((testimonial) => (
            <View
              key={testimonial.id}
              className="w-80 bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-md"
            >
              {/* Rating */}
              <View className="flex-row mb-4">
                {renderStars(testimonial.rating)}
              </View>

              {/* Comment */}
              <Text className="text-gray-700 text-base leading-relaxed mb-6">
                "{testimonial.comment}"
              </Text>

              {/* User Info */}
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </Text>
                  </LinearGradient>
                </View>
                <View>
                  <Text className="text-gray-800 font-semibold text-base">
                    {testimonial.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {testimonial.role}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Trust Indicators */}
      <View className="bg-white/80 rounded-2xl p-6 shadow-lg backdrop-blur-md">
        <View className="flex-row justify-around items-center">
          <View className="items-center">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: '#FED7AA' }}>
              <Ionicons name="people-outline" size={24} color="#FB923C" />
            </View>
            <Text className="text-lg font-bold text-gray-800">98%</Text>
            <Text className="text-xs text-gray-600 text-center">Satisfaction Rate</Text>
          </View>
          
          <View className="items-center">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: '#E0E7FF' }}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#6B46C1" />
            </View>
            <Text className="text-lg font-bold text-gray-800">100%</Text>
            <Text className="text-xs text-gray-600 text-center">Verified Providers</Text>
          </View>
          
          <View className="items-center">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: '#FCE7F3' }}>
              <Ionicons name="time-outline" size={24} color="#EC4899" />
            </View>
            <Text className="text-lg font-bold text-gray-800">24/7</Text>
            <Text className="text-xs text-gray-600 text-center">Support</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Testimonials;
