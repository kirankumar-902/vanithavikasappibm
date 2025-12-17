const axios = require('axios');

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode';

/**
 * Get autocomplete suggestions for a location query
 * @param {string} text - The search text
 * @param {string} countryCode - Optional country code filter (e.g., 'in' for India)
 * @returns {Promise<Array>} Array of location suggestions
 */
const getLocationAutocomplete = async (text, countryCode = 'in') => {
  try {
    const response = await axios.get(`${GEOAPIFY_BASE_URL}/autocomplete`, {
      params: {
        text,
        apiKey: GEOAPIFY_API_KEY,
        filter: `countrycode:${countryCode}`,
        limit: 10,
        format: 'json'
      }
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Geoapify autocomplete error:', error);
    throw new Error('Failed to fetch location suggestions');
  }
};

/**
 * Get detailed location information by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Detailed location information
 */
const getLocationByCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(`${GEOAPIFY_BASE_URL}/reverse`, {
      params: {
        lat,
        lon,
        apiKey: GEOAPIFY_API_KEY,
        format: 'json'
      }
    });

    return response.data.results?.[0] || null;
  } catch (error) {
    console.error('Geoapify reverse geocoding error:', error);
    throw new Error('Failed to fetch location details');
  }
};

/**
 * Parse Geoapify location data into our standard format
 * @param {Object} locationData - Raw location data from Geoapify
 * @returns {Object} Parsed location object
 */
const parseLocationData = (locationData) => {
  if (!locationData) return {};

  return {
    city: locationData.city || locationData.town || locationData.village || '',
    state: locationData.state || locationData.region || '',
    pincode: locationData.postcode || '',
    fullAddress: locationData.address_line1 || '',
    latitude: locationData.lat,
    longitude: locationData.lon,
    placeId: locationData.place_id,
    country: locationData.country || 'India',
    district: locationData.district || locationData.county || '',
    formatted: locationData.formatted || ''
  };
};

module.exports = {
  getLocationAutocomplete,
  getLocationByCoordinates,
  parseLocationData
};