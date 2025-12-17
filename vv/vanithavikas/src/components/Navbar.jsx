import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '#services-section' },
    { name: 'Features', href: '#features-section' },
    { name: 'About', href: '#' },
    { name: 'Contact', href: '#' }
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-md shadow-xl rounded-full border border-gray-200/50 max-w-4xl mx-auto">
      <div className="px-4 md:px-6 relative">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
              <HeartIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="text-sm md:text-lg font-bold gradient-text hidden sm:block">
              Vanitha Vikas
            </span>
            <span className="text-sm font-bold gradient-text sm:hidden">
              VV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-all duration-300 hover:scale-105"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link 
              to="/login"
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              <UserIcon className="w-4 h-4" />
              <span>Login</span>
            </Link>
            <Link 
              to="/register"
              className="px-3 lg:px-4 py-1.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs lg:text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
          >
            {isOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 mt-2 transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="border-t border-gray-200 pt-3 px-4 space-y-3">
              <Link 
                to="/login"
                className="flex items-center space-x-2 w-full text-left text-gray-700 hover:text-orange-500 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link 
                to="/register"
                className="block px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300 w-full text-center"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;