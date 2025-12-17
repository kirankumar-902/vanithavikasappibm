import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI, authAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import MyServices from '../components/MyServices';
import AddService from '../components/AddService';
import Messages from '../components/Messages';
import UserProfile from '../components/UserProfile';
import {
    HeartIcon,
    UserCircleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [editingService, setEditingService] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'provider') {
            navigate('/service-dashboard');
            return;
        }

        setUser(parsedUser);
        fetchMyServices();
    }, [navigate]);

    const fetchMyServices = async () => {
        try {
            const response = await servicesAPI.getMy();
            if (response.data.success) {
                setServices(response.data.data.services);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            showToast('Failed to fetch services', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setEditingService(null);
    };

    const handleAddService = () => {
        setEditingService(null);
        setActiveSection('add-service');
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setActiveSection('add-service');
    };

    const handleServiceSuccess = () => {
        setActiveSection('my-services');
        setEditingService(null);
        fetchMyServices();
        showToast(
            editingService ? 'Service updated successfully' : 'Service created successfully',
            'success'
        );
    };

    const handleProfileUpdate = async (profileData) => {
        try {
            const formData = new FormData();
            
            if (profileData.phoneNumber) {
                formData.append('phoneNumber', profileData.phoneNumber);
            }
            
            if (profileData.location) {
                formData.append('location', JSON.stringify(profileData.location));
            }

            const response = await authAPI.updateProfile(formData);
            
            if (response.data.success) {
                const updatedUser = response.data.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                showToast('Profile updated successfully', 'success');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Sidebar */}
            <Sidebar 
                user={user} 
                userRole="provider" 
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
            />

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-content">
                    {activeSection === 'dashboard' && (
                        <>
                            {/* Page Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Provider Dashboard</h1>
                                <p className="text-gray-600">Manage your services and grow your business</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Services</p>
                                            <p className="text-3xl font-bold text-gray-800">{services.length}</p>
                                        </div>
                                        <div className="stat-icon blue">
                                            <ChartBarIcon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Active Services</p>
                                            <p className="text-3xl font-bold text-gray-800">
                                                {services.filter(s => s.isActive).length}
                                            </p>
                                        </div>
                                        <div className="stat-icon green">
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Profile Status</p>
                                            <p className="text-sm font-medium text-green-600">
                                                {user?.isVerified ? 'Verified' : 'Pending'}
                                            </p>
                                        </div>
                                        <div className="stat-icon purple">
                                            <UserCircleIcon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="dashboard-card p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setActiveSection('add-service')}
                                        className="p-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-left"
                                    >
                                        <h3 className="font-semibold mb-2">Add New Service</h3>
                                        <p className="text-sm opacity-90">Create a new service offering</p>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('my-services')}
                                        className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left"
                                    >
                                        <h3 className="font-semibold mb-2">Manage Services</h3>
                                        <p className="text-sm opacity-90">Edit or delete existing services</p>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('messages')}
                                        className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left"
                                    >
                                        <h3 className="font-semibold mb-2">View Messages</h3>
                                        <p className="text-sm opacity-90">Chat with potential clients</p>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeSection === 'my-services' && (
                        <MyServices 
                            onAddService={handleAddService}
                            onEditService={handleEditService}
                        />
                    )}

                    {activeSection === 'add-service' && (
                        <AddService 
                            service={editingService}
                            onSuccess={handleServiceSuccess}
                            onCancel={() => setActiveSection(editingService ? 'my-services' : 'dashboard')}
                        />
                    )}

                    {activeSection === 'messages' && (
                        <Messages user={user} />
                    )}

                    {activeSection === 'profile' && (
                        <UserProfile user={user} onUpdate={handleProfileUpdate} />
                    )}
                </div>
            </div>
        </div>
    );
};

const ServiceCard = ({ service, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Service Image */}
            {service.serviceImage && (
                <div className="h-40 bg-gray-200 overflow-hidden">
                    <img
                        src={service.serviceImage}
                        alt={service.serviceName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-4">
                {/* Service Header */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {service.serviceName}
                    </h3>
                    <span className="text-lg font-bold text-orange-500">
                        ₹{service.price}
                    </span>
                </div>

                {/* Category */}
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mb-2">
                    {service.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                </p>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">
                        Created {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(service)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ServiceModal = ({ service, onClose, onSuccess, onError }) => {
    const [formData, setFormData] = useState({
        serviceName: service?.serviceName || '',
        category: service?.category || '',
        description: service?.description || '',
        price: service?.price || ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(service?.serviceImage || null);
    const [loading, setLoading] = useState(false);

    const categories = [
        { value: 'tailoring', label: 'Tailoring' },
        { value: 'cooking', label: 'Cooking' },
        { value: 'beauty-services', label: 'Beauty Services' },
        { value: 'teaching', label: 'Teaching' },
        { value: 'arts-and-crafts', label: 'Arts & Crafts' },
        { value: 'other', label: 'Other' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();

            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            if (imageFile) {
                submitData.append('serviceImage', imageFile);
            }

            if (service) {
                await servicesAPI.update(service._id, submitData);
            } else {
                await servicesAPI.create(submitData);
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving service:', error);
            onError(error.response?.data?.message || 'Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {service ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Service Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter service name"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (₹) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="1"
                                max="100000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter price"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Describe your service..."
                            />
                        </div>

                        {/* Service Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Image
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-2">Upload service image</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="serviceImage"
                                        />
                                        <label
                                            htmlFor="serviceImage"
                                            className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Choose File
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    service ? 'Update Service' : 'Create Service'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, type, onClose }) => {
    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ${type === 'success'
            ? 'bg-green-100/90 text-green-800 border border-green-200'
            : 'bg-red-100/90 text-red-800 border border-red-200'
            }`}>
            {type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
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

export default ProviderDashboard;