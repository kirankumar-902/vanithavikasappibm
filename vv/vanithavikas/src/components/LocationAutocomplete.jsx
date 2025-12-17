import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { locationAPI } from '../utils/api';

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Search for a location...",
  className = "",
  required = false 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(value || null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setQuery(value.formatted || `${value.city}, ${value.state}`);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchText) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching suggestions for:', searchText);
      const response = await locationAPI.autocomplete(searchText);
      console.log('API Response:', response.data);
      const suggestions = response.data.data?.suggestions || response.data.suggestions || [];
      console.log('Parsed suggestions:', suggestions);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      console.error('Error details:', error.response?.data);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedLocation(null);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce API call
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationData = {
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.postcode,
      fullAddress: suggestion.address_line1,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      placeId: suggestion.id,
      country: suggestion.country,
      district: suggestion.district,
      formatted: suggestion.formatted
    };

    setSelectedLocation(locationData);
    setQuery(suggestion.formatted);
    setShowSuggestions(false);
    setSuggestions([]);

    if (onChange) {
      onChange(locationData);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLocation(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (onChange) {
      onChange(null);
    }
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.formatted}
                  </p>
                  {suggestion.district && (
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.district}, {suggestion.state}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No locations found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;