import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI, chatAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import LocationAutocomplete from '../components/LocationAutocomplete';
import Messages from '../components/Messages';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const ServiceDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('find-services');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'tailoring', label: 'Tailoring' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'beauty-services', label: 'Beauty Services' },
    { value: 'teaching', label: 'Teaching' },
    { value: 'arts-and-crafts', label: 'Arts & Crafts' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'user') {
      navigate('/provider-dashboard');
      return;
    }

    setUser(parsedUser);
    fetchServices();
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const params = {};
      
      // Add category filter
      if (selectedCategory) params.category = selectedCategory;
      
      // Add text search filter
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Add location-based search if location is selected
      if (selectedLocation) {
        if (selectedLocation.latitude && selectedLocation.longitude) {
          params.lat = selectedLocation.latitude;
          params.lon = selectedLocation.longitude;
          params.radius = 50; // 50km radius
        } else {
          params.location = selectedLocation.city || selectedLocation.formatted;
        }
      }

      console.log('Fetching services with params:', params);
      const response = await servicesAPI.getAll(params);
      if (response.data.success) {
        console.log(`Found ${response.data.data.services.length} services`);
        setServices(response.data.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Debounce the search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchServices();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedCategory, selectedLocation, searchTerm, user]);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleStartChat = async (serviceId, provider) => {
    try {
      const response = await chatAPI.startChat(serviceId);
      
      if (response.data.success) {
        // Switch to messages section
        setActiveSection('messages');
        console.log('Chat started successfully:', response.data);
      } else {
        console.error('Chat start failed:', response.data);
        alert(response.data.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start chat. Please try again.';
      alert(errorMessage);
    }
  };

  // Services are already filtered by the backend, so we can use them directly
  const filteredServices = services;

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
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        userRole="user" 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-content">
          {activeSection === 'find-services' && (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Services</h1>
                <p className="text-gray-600">Discover amazing services from talented providers</p>
              </div>

              {/* Search and Filters */}
              <div className="dashboard-card p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search services, providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                    />
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FunnelIcon className="w-5 h-5" />
                    <span>Filters</span>
                  </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                        >
                          <option value="">All Categories</option>
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <LocationAutocomplete
                          value={selectedLocation}
                          onChange={handleLocationChange}
                          placeholder="Search for location..."
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <ServiceCard key={service._id} service={service} onStartChat={handleStartChat} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No services found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'messages' && (
            <Messages user={user} />
          )}

          {activeSection === 'profile' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
              <p className="text-gray-600">Manage your profile settings (Coming Soon)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onStartChat }) => {
  const handleStartChat = async () => {
    try {
      await onStartChat(service._id, service.provider);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="service-card">
      {/* Service Image */}
      {service.serviceImage && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={service.serviceImage}
            alt={service.serviceName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Service Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {service.serviceName}
          </h3>
          <span className="text-xl font-bold text-orange-500">
            ₹{service.price}
          </span>
        </div>

        {/* Category */}
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mb-3">
          {service.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>

        {/* Provider Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-3 mb-3">
            {service.provider.profilePicture ? (
              <img
                src={service.provider.profilePicture}
                alt={service.provider.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-10 h-10 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-800">
                {service.provider.firstName} {service.provider.lastName}
              </p>
              {(service.location?.city || service.provider.location?.city) && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <MapPinIcon className="w-3 h-3" />
                  <span>
                    {service.location?.city || service.provider.location?.city}
                    {service.location?.state && `, ${service.location.state}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex space-x-2">
            <a
              href={`tel:${service.provider.phoneNumber}`}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Call</span>
            </a>
            <button
              onClick={handleStartChat}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;