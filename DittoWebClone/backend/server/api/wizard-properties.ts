import express from 'express';
import { mongodbStorage } from '../mongodb-storage';
import { Property } from '../../shared/mongodb-schemas'; // adjust path as needed

const router = express.Router();

// Property wizard endpoint - enhanced filtering for wizard preferences
router.get('/', async (req, res) => {
  try {
    console.log('Property Wizard API called');
    console.log('Request query parameters:', req.query);

    const {
      minPrice,
      maxPrice,
      location,
      configurations,
      possessionTimeline,
      baseProjectPrice
    } = req.query;

    // Build MongoDB query filters
    const query: any = {};

    // Direct BaseProjectPrice filtering
    if (baseProjectPrice) {
      query['configurations.BaseProjectPrice'] = parseInt(baseProjectPrice as string, 10);
    }

    // 1. Budget Range Filtering - Filter by configurations.BaseProjectPrice
    if (minPrice || maxPrice) {
      query['configurations.BaseProjectPrice'] = {};
      
      if (minPrice) {
        query['configurations.BaseProjectPrice'].$gte = parseInt(String(minPrice), 10);
      }
      
      if (maxPrice) {
        query['configurations.BaseProjectPrice'].$lte = parseInt(String(maxPrice), 10);
      }
    }

    // 2. Location Filtering - Filter by Area field (case-insensitive)
    if (location && String(location) !== 'any') {
      // Handle multiple locations separated by commas
      const locations = String(location).split(',').map(loc => loc.trim());
      
      if (locations.length === 1) {
        // Single location - exact match with case-insensitive
        query.Area = { $regex: locations[0], $options: 'i' };
      } else {
        // Multiple locations - match any of them
        query.Area = { $in: locations.map(loc => new RegExp(loc, 'i')) };
      }
    }

    // 3. Configuration Filtering - Filter by configurations.type
    if (configurations && String(configurations) !== 'any') {
      // Handle multiple configurations separated by commas
      const configs = String(configurations).split(',').map(config => config.trim());
      
      if (configs.length === 1) {
        // Single configuration - exact match with case-insensitive
        query['configurations.type'] = { $regex: configs[0], $options: 'i' };
      } else {
        // Multiple configurations - match any of them
        query['configurations.type'] = { $in: configs.map(config => new RegExp(config, 'i')) };
      }
    }

    // Direct configurations.type filtering
    if (configurations && String(configurations) !== 'any') {
      query['configurations.type'] = { $regex: `^${configurations}$`, $options: 'i' };
    }

    // 4. Possession Timeline Filtering - Filter by Possession_date
    if (possessionTimeline && String(possessionTimeline) !== 'any') {
      const timeline = String(possessionTimeline).toLowerCase();
      
      // Since Possession_date is stored as string in DD-MM-YYYY format, we'll use regex matching
      // for more flexible filtering based on the timeline requirements
      switch (timeline) {
        case 'ready-to-move':
          // Properties ready to move - possession date should be in the past or very near future
          // Match dates that are in the past or current year
          const currentYear = new Date().getFullYear();
          query.Possession_date = { 
            $regex: `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(${currentYear}|${currentYear - 1})$`
          };
          break;
          
        case '0-1-year':
          // Properties available within 1 year - match current year and next year
          const nextYear = new Date().getFullYear() + 1;
          query.Possession_date = { 
            $regex: `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(${new Date().getFullYear()}|${nextYear})$`
          };
          break;
          
        case '1-2-years':
          // Properties available in 1-2 years
          const year1 = new Date().getFullYear() + 1;
          const year2 = new Date().getFullYear() + 2;
          query.Possession_date = { 
            $regex: `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(${year1}|${year2})$`
          };
          break;
          
        case '2-3-years':
          // Properties available in 2-3 years
          const year2_start = new Date().getFullYear() + 2;
          const year3 = new Date().getFullYear() + 3;
          query.Possession_date = { 
            $regex: `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(${year2_start}|${year3})$`
          };
          break;
          
        case '3-4-years':
          // Properties available in 3-4 years
          const year3_start = new Date().getFullYear() + 3;
          const year4 = new Date().getFullYear() + 4;
          query.Possession_date = { 
            $regex: `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(${year3_start}|${year4})$`
          };
          break;
          
        case '5-years':
          // Properties available in 5+ years
          const year5 = new Date().getFullYear() + 5;
          query.Possession_date = { 
            $regex: `^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(${year5}|[0-9]{4})$`
          };
          break;
          
        default:
          // For any other timeline, try to match the text in Possession_date
          query.Possession_date = { $regex: timeline, $options: 'i' };
      }
    }

    // Direct Possession_date filtering
    if (req.query.Possession_date) {
      query.Possession_date = req.query.Possession_date;
    }

    console.log('Wizard MongoDB query:', JSON.stringify(query, null, 2));

    // Execute the query using the Property model directly for better control
    const properties = await Property.find(query).sort({ createdAt: -1 });

    console.log(`Wizard retrieved ${properties.length} properties from database`);

    // Transform the results to match the expected format
    const transformedProperties = properties.map(property => {
      const propertyObj = property.toObject();
      
      // Ensure we have the required fields for the frontend
      return {
        _id: propertyObj._id,
        RERA_Number: propertyObj.RERA_Number || propertyObj.reraNumber,
        ProjectName: propertyObj.ProjectName || propertyObj.projectName,
        BuilderName: propertyObj.BuilderName || propertyObj.developerName,
        Area: propertyObj.Area || propertyObj.location,
        Possession_date: propertyObj.Possession_date || propertyObj.possessionDate,
        Price_per_sft: propertyObj.Price_per_sft || propertyObj.pricePerSqft,
        configurations: propertyObj.configurations || [],
        propertyType: propertyObj.propertyType,
        constructionStatus: propertyObj.constructionStatus,
        images: propertyObj.images || [],
        amenities: propertyObj.amenities || [],
        description: propertyObj.description || propertyObj.remarksComments,
        rating: propertyObj.rating || propertyObj.relaiRating,
        // Include other important fields
        developerName: propertyObj.developerName,
        reraNumber: propertyObj.reraNumber,
        projectName: propertyObj.projectName,
        location: propertyObj.location,
        possessionDate: propertyObj.possessionDate,
        pricePerSqft: propertyObj.pricePerSqft,
        price: propertyObj.price,
        longitude: propertyObj.longitude,
        latitude: propertyObj.latitude,
        bedrooms: propertyObj.bedrooms,
        bathrooms: propertyObj.bathrooms,
        area: propertyObj.area,
        features: propertyObj.features,
        builder: propertyObj.builder,
        possession: propertyObj.possession,
        createdAt: propertyObj.createdAt,
        updatedAt: propertyObj.updatedAt
      };
    });

    res.json({
      properties: transformedProperties,
      total: transformedProperties.length,
      filters: {
        minPrice: minPrice ? parseInt(String(minPrice), 10) : undefined,
        maxPrice: maxPrice ? parseInt(String(maxPrice), 10) : undefined,
        location: location || undefined,
        configurations: configurations || undefined,
        possessionTimeline: possessionTimeline || undefined
      }
    });

  } catch (error) {
    console.error('Error in wizard properties API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/unique-possession-dates', async (req, res) => {
  try {
    const dates = await Property.distinct('Possession_date');
    res.json({ dates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch possession dates' });
  }
});

export { router as wizardPropertiesRouter };