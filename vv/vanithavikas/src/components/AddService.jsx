import React, { useState } from 'react';
import { servicesAPI } from '../utils/api';
import LocationAutocomplete from './LocationAutocomplete';
import {
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const AddService = ({ service, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    serviceName: service?.serviceName || '',
    category: service?.category || '',
    description: service?.description || '',
    price: service?.price || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(service?.serviceImage || null);
  const [selectedLocation, setSelectedLocation] = useState(service?.location || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
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

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedLocation) {
      setError('Please select a location for your service');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add location data
      submitData.append('location', JSON.stringify(selectedLocation));
      
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
      setError(error.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {service ? 'Edit Service' : 'Add New Service'}
        </h2>
        <p className="text-gray-600">
          {service ? 'Update your service details' : 'Create a new service offering'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

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

        {/* Service Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Location *
          </label>
          <LocationAutocomplete
            value={selectedLocation}
            onChange={handleLocationChange}
            placeholder="Search for service location..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps customers find services in their area
          </p>
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

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
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
              <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>{service ? 'Update Service' : 'Create Service'}</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddService;