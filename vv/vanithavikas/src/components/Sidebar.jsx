import React, { useState } from 'react';
import {
  HeartIcon,
  HomeIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ user, userRole, activeSection, onSectionChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const userNavItems = [
    {
      name: 'Find Services',
      key: 'find-services',
      icon: MagnifyingGlassIcon
    },
    {
      name: 'Messages',
      key: 'messages',
      icon: ChatBubbleLeftRightIcon
    },
    {
      name: 'My Profile',
      key: 'profile',
      icon: UserCircleIcon
    }
  ];

  const providerNavItems = [
    {
      name: 'Dashboard',
      key: 'dashboard',
      icon: HomeIcon
    },
    {
      name: 'My Services',
      key: 'my-services',
      icon: ChartBarIcon
    },
    {
      name: 'Add Service',
      key: 'add-service',
      icon: PlusIcon
    },
    {
      name: 'Messages',
      key: 'messages',
      icon: ChatBubbleLeftRightIcon
    },
    {
      name: 'Profile',
      key: 'profile',
      icon: UserCircleIcon
    }
  ];

  const navItems = userRole === 'provider' ? providerNavItems : userNavItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="mobile-menu-button"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-visible' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Vanitha Vikas</h1>
              <p className="text-sm text-white/80 capitalize">
                {userRole === 'provider' ? 'Provider Portal' : 'Find Services'}
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                {user?.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onSectionChange(item.key);
                closeMobileMenu();
              }}
              className={`sidebar-nav-item w-full text-left ${activeSection === item.key ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;