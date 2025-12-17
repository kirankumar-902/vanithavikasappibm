import React, { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const Testimonials = () => {
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

    const element = document.getElementById('testimonials-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Tailoring Service Provider',
      image: '👩‍💼',
      rating: 5,
      text: 'Vanitha Vikas has transformed my small tailoring business. I now have a steady stream of customers and can support my family better.',
      color: 'from-pink-400 to-rose-400'
    },
    {
      name: 'Anita Reddy',
      role: 'Customer',
      image: '👩‍🦱',
      rating: 5,
      text: 'Found the most amazing cooking service through this platform. The food is delicious and the service is exceptional!',
      color: 'from-purple-400 to-indigo-400'
    },
    {
      name: 'Meera Patel',
      role: 'Beauty Service Provider',
      image: '👩‍🎨',
      rating: 5,
      text: 'The real-time chat feature makes it so easy to connect with customers. My business has grown significantly since joining.',
      color: 'from-orange-400 to-red-400'
    }
  ];

  return (
    <section id="testimonials-section" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What Our <span className="gradient-text">Community</span> Says
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real stories from real people who have found success and satisfaction 
            through our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-2xl mr-4`}>
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className={`mt-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-3">
                <div className="text-3xl md:text-4xl font-bold gradient-text">500+</div>
                <div className="text-sm md:text-base text-gray-600">Active Providers</div>
              </div>
              <div className="space-y-3">
                <div className="text-3xl md:text-4xl font-bold gradient-text">1000+</div>
                <div className="text-sm md:text-base text-gray-600">Happy Customers</div>
              </div>
              <div className="space-y-3">
                <div className="text-3xl md:text-4xl font-bold gradient-text">50+</div>
                <div className="text-sm md:text-base text-gray-600">Cities Covered</div>
              </div>
              <div className="space-y-3">
                <div className="text-3xl md:text-4xl font-bold gradient-text">4.8★</div>
                <div className="text-sm md:text-base text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;