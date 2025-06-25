import express from 'express';
import { mongodbStorage } from '../mongodb-storage';

const router = express.Router();

// Property wizard endpoint - uses exact same filtering logic as All Properties page
router.get('/', async (req, res) => {
  try {
    console.log('Property Wizard API called');
    console.log('Request query parameters:', req.query);

    const {
      minPrice,
      maxPrice,
      budget,
      location,
      propertyType,
      configurations,
      constructionStatus,
      communityType,
      possessionTimeline
    } = req.query;

    // Build filters object using exact same structure as All Properties page
    const filters: any = {};

    // 1. Budget filtering - handle both direct minPrice/maxPrice and budget string conversion
    if (minPrice) {
      filters.minPrice = parseInt(String(minPrice), 10);
    }
    if (maxPrice) {
      filters.maxPrice = parseInt(String(maxPrice), 10);
    }
    
    // Convert budget string to minPrice/maxPrice if budget is provided
    if (budget && String(budget) !== 'any') {
      const budgetStr = String(budget).toLowerCase();
      console.log('Converting budget string:', budgetStr);
      
      if (budgetStr === 'under-50l') {
        filters.maxPrice = 5000000; // 50L
        console.log('Budget: Under 50L - maxPrice set to 5000000');
      } else if (budgetStr === 'above-2cr') {
        filters.minPrice = 20000000; // 2Cr
        console.log('Budget: Above 2Cr - minPrice set to 20000000');
      } else if (budgetStr === '50l-75l') {
        filters.minPrice = 5000000; // 50L
        filters.maxPrice = 7500000; // 75L
        console.log('Budget: 50L-75L - range 5000000 to 7500000');
      } else if (budgetStr === '75l-1cr') {
        filters.minPrice = 7500000; // 75L
        filters.maxPrice = 10000000; // 1Cr
        console.log('Budget: 75L-1Cr - range 7500000 to 10000000');
      } else if (budgetStr === '1cr-1.5cr') {
        filters.minPrice = 10000000; // 1Cr
        filters.maxPrice = 15000000; // 1.5Cr
        console.log('Budget: 1Cr-1.5Cr - range 10000000 to 15000000');
      } else if (budgetStr === '1.5cr-2cr') {
        filters.minPrice = 15000000; // 1.5Cr
        filters.maxPrice = 20000000; // 2Cr
        console.log('Budget: 1.5Cr-2Cr - range 15000000 to 20000000');
      }
    }

    // 2. Location filtering - handle multiple locations like All Properties page
    if (location && String(location) !== 'any') {
      filters.location = String(location);
    }

    // 3. Property type filtering - exact same logic
    if (propertyType && String(propertyType) !== 'any') {
      filters.propertyType = String(propertyType);
    }

    // 4. Configuration filtering - exact same logic
    if (configurations && String(configurations) !== 'any') {
      filters.configurations = String(configurations);
    }

    // 5. Construction status filtering - exact same logic
    if (constructionStatus && String(constructionStatus) !== 'any') {
      filters.constructionStatus = String(constructionStatus);
    }

    // 6. Community type filtering - using Type of Community column
    if (communityType && String(communityType) !== 'any') {
      filters.communityType = String(communityType);
    }

    // 7. Possession timeline filtering - using PossessionDate column
    if (possessionTimeline && String(possessionTimeline) !== 'any') {
      filters.possessionTimeline = String(possessionTimeline);
    }

    console.log('Wizard filters constructed:', filters);

    // Use the same getAllProperties method with exact same filtering logic
    const properties = await mongodbStorage.getAllProperties(filters);

    console.log(`Wizard retrieved ${properties.length} properties from database`);

    res.json({
      properties,
      total: properties.length,
      filters: filters
    });

  } catch (error) {
    console.error('Error in wizard properties API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as wizardPropertiesRouter };