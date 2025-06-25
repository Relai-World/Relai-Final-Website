import { Request, Response } from 'express';
import { Property } from '../../shared/mongodb-schemas';

/**
 * Get unique values for each property filter field from the database
 */
export async function getFilterOptionsHandler(req: Request, res: Response) {
  try {
    // Query for unique property types
    const propertyTypeData = await Property.distinct('propertyType');
    const propertyTypes = propertyTypeData.filter(Boolean);
    
    // Query for unique configurations
    const configurationsData = await Property.distinct('configurations');
    const configurations = configurationsData.filter(Boolean);
    
    // Query for unique locations
    const locationsData = await Property.distinct('location');
    const locations = locationsData.filter(Boolean);
    
    // Static possession options
    const possessionOptions = [
      'Ready to Move',
      'New Launch'
    ];
    
    // Query for all properties to get budget range
    const allProperties = await Property.find({});
    
    const minBudgetValues = allProperties
      .map((item: any) => parseFloat(item.minimumBudget || item.price))
      .filter((price: number) => !isNaN(price) && price > 0);
      
    const maxBudgetValues = allProperties
      .map((item: any) => parseFloat(item.maximumBudget || item.price))
      .filter((price: number) => !isNaN(price) && price > 0);
    
    const allBudgetValues = [...minBudgetValues, ...maxBudgetValues];
    
    const priceRange = {
      min: allBudgetValues.length > 0 ? Math.floor(Math.min(...allBudgetValues)) : 0,
      max: allBudgetValues.length > 0 ? Math.ceil(Math.max(...allBudgetValues)) : 50000000
    };
    
    res.json({
      propertyTypes,
      configurations,
      locations,
      possessionOptions,
      priceRange
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ 
      error: 'Failed to fetch filter options',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get price range data for the range slider
 */
export async function getPriceRangeHandler(req: Request, res: Response) {
  try {
    // Query for all properties to get budget range
    const allProperties = await Property.find({});
    
    const minBudgetValues = allProperties
      .map((item: any) => parseFloat(item.minimumBudget || item.price))
      .filter((price: number) => !isNaN(price) && price > 0);
      
    const maxBudgetValues = allProperties
      .map((item: any) => parseFloat(item.maximumBudget || item.price))
      .filter((price: number) => !isNaN(price) && price > 0);
    
    const allBudgetValues = [...minBudgetValues, ...maxBudgetValues];
    
    const priceRange = {
      min: allBudgetValues.length > 0 ? Math.floor(Math.min(...allBudgetValues)) : 0,
      max: allBudgetValues.length > 0 ? Math.ceil(Math.max(...allBudgetValues)) : 50000000
    };
    
    res.json(priceRange);
  } catch (error) {
    console.error('Error fetching price range:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price range',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}