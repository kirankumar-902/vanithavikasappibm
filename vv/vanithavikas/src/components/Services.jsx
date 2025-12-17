import React, { useEffect, useState } from 'react';
import { 
  ScissorsIcon, 
  AcademicCapIcon, 
  PaintBrushIcon, 
  SparklesIcon,
  CakeIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const Services = () => {
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

    const element = document.getElementById('services-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: ScissorsIcon,
      title: 'Tailoring',
      description: 'Expert tailoring services for all your clothing needs',
      color: 'from-orange-400 to-red-400',
      bgColor: 'bg-orange-50',
      delay: '0s'
    },
    {
      icon: CakeIcon,
      title: 'Cooking',
      description: 'Delicious home-cooked meals and catering services',
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50',
      delay: '0.1s'
    },
    {
      icon: SparklesIcon,
      title: 'Beauty Services',
      description: 'Professional beauty and wellness treatments',
      color: 'from-pink-400 to-purple-400',
      bgColor: 'bg-pink-50',
      delay: '0.2s'
    },
    {
      icon: AcademicCapIcon,
      title: 'Teaching',
      description: 'Quality education and tutoring services',
      color: 'from-blue-400 to-purple-400',
      bgColor: 'bg-blue-50',
      delay: '0.3s'
    },
    {
      icon: PaintBrushIcon,
      title: 'Arts & Crafts',
      description: 'Creative handmade items and artistic services',
      color: 'from-green-400 to-teal-400',
      bgColor: 'bg-green-50',
      delay: '0.4s'
    },
    {
      icon: HeartIcon,
      title: 'Other Services',
      description: 'Various other specialized services',
      color: 'from-purple-400 to-indigo-400',
      bgColor: 'bg-purple-50',
      delay: '0.5s'
    }
  ];

  return (
    <section id="services-section" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Our Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover a wide range of services provided by talented women in your community. 
            Each service is delivered with care, expertise, and passion.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`card-hover ${service.bgColor} rounded-2xl p-8 border border-gray-100 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: service.delay }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                <service.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

              {/* CTA */}
              <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-300 group">
                Explore Services
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <button className="btn-primary">
            View All Services
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;