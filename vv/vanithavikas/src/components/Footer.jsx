import React from 'react';
import { 
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold gradient-text">Vanitha Vikas</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Empowering women entrepreneurs by connecting them with customers 
              in their local communities. Building a stronger, more inclusive economy.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-lg">📘</span>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-lg">📷</span>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-lg">🐦</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Quick Links</h4>
            <ul className="space-y-3">
              {['Find Services', 'Become a Provider', 'How it Works', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Services</h4>
            <ul className="space-y-3">
              {['Tailoring', 'Cooking', 'Beauty Services', 'Teaching', 'Arts & Crafts', 'Other Services'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">hello@vanithavikas.com</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h5 className="font-semibold">Stay Updated</h5>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-orange-400 to-purple-500 rounded-r-full hover:from-orange-500 hover:to-purple-600 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © 2024 Vanitha Vikas. Made with ❤️ for women entrepreneurs.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-purple-500 to-indigo-500"></div>
    </footer>
  );
};

export default Footer;