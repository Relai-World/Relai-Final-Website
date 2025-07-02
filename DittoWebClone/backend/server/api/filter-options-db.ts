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
    // Flatten, normalize, and deduplicate configuration types
    const configurationTypes = Array.from(new Set(
      configurationsData
        .flatMap((item: any) => {
          if (typeof item === 'string') return [item];
          if (Array.isArray(item)) return item.map(cfg => typeof cfg === 'object' && cfg.type ? cfg.type : cfg).filter(Boolean);
          if (typeof item === 'object' && item && item.type) return [item.type];
          return [];
        })
        .filter(Boolean)
        .map((type: string) => type.trim())
        .filter((type: string) => type && type.toLowerCase() !== 'n/a' && type.toLowerCase() !== 'not specified')
        .map((type: string) => {
          // Remove BHK, -BHK, and whitespace, and normalize delimiters
          let cleaned = type.replace(/\s*BHK\s*/gi, '').replace(/-BHK/gi, '').replace(/\s+/g, '');
          cleaned = cleaned.replace(/&/g, ',').replace(/\//g, ',').replace(/\+/g, ',').replace(/\band\b/gi, ',');
          // Split, sort numerically, and join back for combinations
          let parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
          parts = parts.map(p => isNaN(Number(p)) ? p : Number(p));
          parts = parts.sort((a, b) => (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b)));
          return parts.join(',');
        })
        .filter(Boolean)
    )).sort((a, b) => {
      // Try to sort numerically by first number
      const aNum = parseFloat(a.split(',')[0]);
      const bNum = parseFloat(b.split(',')[0]);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b);
    });
    
    // Query for unique locations
    const locationsData = await Property.distinct('Area');
    console.log('LOCATIONS FROM DB:', locationsData);
    console.log('Locations data:', locationsData);
    const locations = locationsData.filter(Boolean);
    console.log('CLEANED LOCATIONS:', locations); 
    console.log('Locations:', locations);
    
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
      configurations: configurationTypes,
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