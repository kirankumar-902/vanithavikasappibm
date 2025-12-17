import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Lottie from 'lottie-react';
import womanAnimation from '../assets/Woman Working on Laptop in Office.json';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        {/* Floating leaves */}
        <div className="absolute top-20 left-10 animate-leaf-sway">
          <div className="w-8 h-16 bg-gradient-to-b from-orange-300 to-orange-400 rounded-full transform rotate-45 opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 animate-leaf-sway" style={{ animationDelay: '1s' }}>
          <div className="w-6 h-12 bg-gradient-to-b from-purple-300 to-purple-400 rounded-full transform -rotate-45 opacity-60"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-leaf-sway" style={{ animationDelay: '2s' }}>
          <div className="w-10 h-20 bg-gradient-to-b from-yellow-300 to-orange-300 rounded-full transform rotate-12 opacity-60"></div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            {/* Brand Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft">
              <SparklesIcon className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Empowering Women Entrepreneurs</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-responsive-xl font-bold leading-tight">
                <span className="gradient-text">Vanitha Vikas</span>
                <br />
                <span className="text-gray-800">Connecting Communities</span>
                <br />
                <span className="gradient-text-cool">Through Skills</span>
              </h1>
              
              <p className="text-responsive-lg text-gray-600 leading-relaxed max-w-lg">
                Discover talented women service providers in your community. From tailoring to teaching, 
                cooking to crafts - find the perfect service or showcase your skills.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register?role=user" className="btn-primary group inline-flex items-center justify-center">
                Find Services
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register?role=provider" className="btn-outline inline-flex items-center justify-center">
                Become a Provider
              </Link>
            </div>


          </div>

          {/* Right Illustration */}
          <div className={`relative ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full max-w-lg mx-auto">
              {/* Background gradient circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-purple-200 rounded-full opacity-20 animate-pulse-glow"></div>
              
              {/* Lottie Animation */}
              <div className="relative z-10 p-8">
                <Lottie 
                  animationData={womanAnimation} 
                  loop={true}
                  className="w-full h-full max-w-md mx-auto"
                />
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 animate-float">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute top-1/2 -left-8 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full shadow-lg"></div>
              </div>

              <div className="absolute bottom-1/4 right-8 animate-float" style={{ animationDelay: '2s' }}>
                <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full shadow-lg"></div>
              </div>

              {/* Decorative leaves */}
              <div className="absolute -top-8 left-8 animate-leaf-sway">
                <div className="w-4 h-8 bg-gradient-to-b from-orange-300 to-orange-400 rounded-full transform rotate-45 opacity-70"></div>
              </div>
              <div className="absolute top-1/3 -right-6 animate-leaf-sway" style={{ animationDelay: '1.5s' }}>
                <div className="w-3 h-6 bg-gradient-to-b from-purple-300 to-purple-400 rounded-full transform -rotate-30 opacity-70"></div>
              </div>
              <div className="absolute bottom-1/4 -left-4 animate-leaf-sway" style={{ animationDelay: '0.5s' }}>
                <div className="w-5 h-10 bg-gradient-to-b from-yellow-300 to-orange-300 rounded-full transform rotate-12 opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;