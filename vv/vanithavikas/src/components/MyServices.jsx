import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../utils/api';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MyServices = ({ onAddService, onEditService }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getMy();
      if (response.data.success) {
        setServices(response.data.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await servicesAPI.delete(serviceId);
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Services</h2>
          <p className="text-gray-600">Manage and track your service offerings</p>
        </div>
        <button
          onClick={onAddService}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New Service</span>
        </button>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onEdit={() => onEditService(service)}
              onDelete={() => handleDeleteService(service._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No services yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first service</p>
          <button
            onClick={onAddService}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Add Your First Service
          </button>
        </div>
      )}
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
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            service.isActive 
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
            onClick={onEdit}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
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

export default MyServices;