import React, { useState, useRef } from 'react';
import {
  UserCircleIcon,
  PencilIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import LocationAutocomplete from './LocationAutocomplete';

const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || null
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const updateData = { ...formData };
      if (profilePicture) {
        updateData.profilePicture = profilePicture;
      }
      
      if (onUpdate) {
        await onUpdate(updateData);
      }
      setIsEditing(false);
      setProfilePicture(null);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      phoneNumber: user?.phoneNumber || '',
      location: user?.location || null
    });
    setProfilePicture(null);
    setProfilePicturePreview(user?.profilePicture || null);
    setIsEditing(false);
  };

  const handleLocationChange = (location) => {
    setFormData({
      ...formData,
      location
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0 relative">
          <div className="relative group">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt={user?.fullName || 'Profile'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <UserCircleIcon className="w-24 h-24 text-gray-400" />
            )}
            
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <button
                  type="button"
                  onClick={handleProfilePictureClick}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <CameraIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                onClick={handleProfilePictureClick}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <PhotoIcon className="w-3 h-3" />
                <span>Change</span>
              </button>
              {profilePicturePreview && (
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <XCircleIcon className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={handleLocationChange}
                    placeholder="Search for your location..."
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="capitalize">{user?.role}</span>
                  {user?.isVerified && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                
                {user?.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}

                {(user?.location?.city || user?.location?.state) && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>
                      {[user?.location?.city, user?.location?.state, user?.location?.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {user?.role === 'provider' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;