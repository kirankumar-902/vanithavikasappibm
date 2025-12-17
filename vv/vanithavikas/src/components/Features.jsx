import React, { useEffect, useState } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  MapPinIcon,
  StarIcon,
  CurrencyRupeeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-time Chat',
      description: 'Connect instantly with service providers through our built-in messaging system',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Providers',
      description: 'All service providers are verified to ensure quality and reliability',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MapPinIcon,
      title: 'Location-based',
      description: 'Find services in your local area for convenient access',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: StarIcon,
      title: 'Quality Ratings',
      description: 'Read reviews and ratings from other customers to make informed decisions',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Fair Pricing',
      description: 'Transparent pricing with no hidden fees or charges',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Support',
      description: 'Join a supportive community of women entrepreneurs and customers',
      color: 'from-teal-500 to-blue-500'
    }
  ];

  return (
    <section id="features-section" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose <span className="gradient-text">Vanitha Vikas</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We provide a secure, reliable, and user-friendly platform that connects 
            customers with skilled women service providers in their community.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className={`mt-20 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-r from-orange-400 to-purple-500 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of women who are already part of our thriving community. 
                Whether you're looking for services or want to provide them, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-orange-500 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                  Find Services
                </button>
                <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-orange-500 transition-all duration-300 transform hover:scale-105">
                  Become a Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;