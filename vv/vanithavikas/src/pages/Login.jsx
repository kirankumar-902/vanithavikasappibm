import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-100/90 text-green-800 border border-green-200' 
        : 'bg-red-100/90 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
      ) : (
        <XCircleIcon className="w-5 h-5 text-red-600" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:6969/api/auth/login', formData);
      
      if (response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        showToast(`Welcome back, ${response.data.data.user.firstName}!`, 'success');
        
        // Redirect based on user role after a short delay
        setTimeout(() => {
          if (response.data.data.user.role === 'provider') {
            navigate('/provider-dashboard');
          } else {
            navigate('/service-dashboard');
          }
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Back to Home Navigation */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-40 flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
          <HeartIcon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold gradient-text">Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Vanitha Vikas account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In to Vanitha Vikas'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-lg">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;