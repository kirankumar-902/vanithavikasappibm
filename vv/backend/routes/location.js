const express = require('express');
const { getLocationAutocomplete, getLocationByCoordinates, parseLocationData } = require('../utils/geoapify');
const auth = require('../middleware/auth');
const router = express.Router();

// Optional auth middleware - doesn't fail if no token provided
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    // If token is provided, validate it
    auth(req, res, next);
  } else {
    // If no token, continue without user info
    req.user = null;
    next();
  }
};

// @route   GET /api/location/autocomplete
// @desc    Get location autocomplete suggestions
// @access  Public (with optional auth)
router.get('/autocomplete', optionalAuth, async (req, res) => {
  try {
    const { text, country = 'in' } = req.query;

    if (!text || text.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search text must be at least 2 characters long'
      });
    }

    const suggestions = await getLocationAutocomplete(text, country);
    
    // Parse and format the suggestions
    const formattedSuggestions = suggestions.map(location => ({
      id: location.place_id,
      formatted: location.formatted,
      city: location.city || location.town || location.village || '',
      state: location.state || location.region || '',
      country: location.country || 'India',
      postcode: location.postcode || '',
      latitude: location.lat,
      longitude: location.lon,
      address_line1: location.address_line1 || '',
      district: location.district || location.county || ''
    }));

    res.json({
      success: true,
      data: {
        suggestions: formattedSuggestions
      }
    });

  } catch (error) {
    console.error('Location autocomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location suggestions'
    });
  }
});

// @route   GET /api/location/reverse
// @desc    Get location details by coordinates
// @access  Private
router.get('/reverse', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const locationData = await getLocationByCoordinates(parseFloat(lat), parseFloat(lon));
    
    if (!locationData) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const parsedLocation = parseLocationData(locationData);

    res.json({
      success: true,
      data: {
        location: parsedLocation
      }
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location details'
    });
  }
});

module.exports = router;