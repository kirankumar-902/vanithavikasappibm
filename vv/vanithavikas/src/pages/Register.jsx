import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
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
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ${type === 'success'
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

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'user'
    });

    // Set role based on URL parameter
    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'user' || roleParam === 'provider') {
            setFormData(prev => ({ ...prev, role: roleParam }));
        }
    }, [searchParams]);

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
            const response = await axios.post('http://localhost:6969/api/auth/register', formData);

            if (response.data.success) {
                // Store token in localStorage
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));

                showToast('Registration successful! Welcome to Vanitha Vikas!', 'success');

                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
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

            {/* Registration Card */}
            <div className="w-full max-w-4xl">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Vanitha Vikas</h1>
                        <p className="text-gray-600">Create your account to get started</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                                            placeholder="First name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>
                            </div>

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

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        pattern="[6-9][0-9]{9}"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                                        placeholder="10-digit mobile number"
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
                                        minLength="6"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50"
                                        placeholder="Minimum 6 characters"
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
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    I want to
                                </label>
                                <div className="space-y-4">
                                    <label className="relative block">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="user"
                                            checked={formData.role === 'user'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${formData.role === 'user'
                                            ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                                            : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:shadow-md'
                                            }`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.role === 'user' ? 'bg-orange-500' : 'bg-gray-400'
                                                    }`}>
                                                    <UserIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold text-gray-800">Find Services</div>
                                                    <div className="text-sm text-gray-600">I'm looking for talented service providers in my community</div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="relative block">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="provider"
                                            checked={formData.role === 'provider'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${formData.role === 'provider'
                                            ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                            : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:shadow-md'
                                            }`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.role === 'provider' ? 'bg-purple-500' : 'bg-gray-400'
                                                    }`}>
                                                    <HeartIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold text-gray-800">Offer Services</div>
                                                    <div className="text-sm text-gray-600">I want to showcase my skills and provide services to others</div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
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
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    `Create ${formData.role === 'user' ? 'User' : 'Provider'} Account`
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default Register;