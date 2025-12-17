const express = require('express');
const router = express.Router();

// Women-specific service categories
const categories = [
  {
    name: 'Dance',
    description: 'Dance classes and choreography services',
    icon: 'musical-notes-outline',
    serviceCount: 35
  },
  {
    name: 'Home Tutoring',
    description: 'Educational tutoring at home',
    icon: 'book-outline',
    serviceCount: 42
  },
  {
    name: 'Home Maid',
    description: 'Domestic cleaning and housekeeping services',
    icon: 'home-outline',
    serviceCount: 55
  },
  {
    name: 'Tailoring',
    description: 'Custom tailoring and alterations',
    icon: 'cut-outline',
    serviceCount: 38
  },
  {
    name: 'Home Food',
    description: 'Home-cooked meals and catering',
    icon: 'restaurant-outline',
    serviceCount: 28
  },
  {
    name: 'Embroidery',
    description: 'Hand embroidery and decorative stitching',
    icon: 'flower-outline',
    serviceCount: 22
  },
  {
    name: 'Beauty',
    description: 'Beauty treatments and makeup services',
    icon: 'sparkles-outline',
    serviceCount: 45
  },
  {
    name: 'Mehendi',
    description: 'Henna art and bridal mehendi',
    icon: 'hand-left-outline',
    serviceCount: 25
  },
  {
    name: 'Yoga & Fitness',
    description: 'Yoga classes and fitness training',
    icon: 'fitness-outline',
    serviceCount: 32
  },
  {
    name: 'Childcare',
    description: 'Babysitting and childcare services',
    icon: 'happy-outline',
    serviceCount: 18
  },
  {
    name: 'Handicrafts',
    description: 'Handmade crafts and art services',
    icon: 'color-palette-outline',
    serviceCount: 15
  },
  {
    name: 'Event Decoration',
    description: 'Event styling and decoration',
    icon: 'balloon-outline',
    serviceCount: 20
  },
  {
    name: 'Hair Styling',
    description: 'Professional hair styling services',
    icon: 'cut-outline',
    serviceCount: 30
  },
  {
    name: 'Baking',
    description: 'Custom cakes and baking services',
    icon: 'cafe-outline',
    serviceCount: 25
  },
  {
    name: 'Music Lessons',
    description: 'Vocal and instrumental music training',
    icon: 'musical-note-outline',
    serviceCount: 12
  }
];

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/:name
// @desc    Get category by name
// @access  Public
router.get('/:name', async (req, res) => {
  try {
    const categoryName = req.params.name;
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

module.exports = router;
