import { Request, Response } from 'express';
import { mongodbStorage } from '../mongodb-storage';

interface ConfigurationDetail {
  type: string;
  sizeRange: number;
  sizeUnit: string;
  facing: string;
  BaseProjectPrice: number;
}

interface RawPropertyData {
  _id?: { $oid: string };
  RERA_Number?: string;
  ProjectName?: string;
  BuilderName?: string;
  Area?: string;
  Possession_date?: string;
  Price_per_sft?: number;
  configurations?: ConfigurationDetail[];
}

interface TransformedPropertyData {
  reraNumber?: string;
  projectName: string;
  developerName?: string;
  location: string;
  possessionDate?: string;
  pricePerSqft?: number;
  propertyType: string;
  name: string;
  price: number;
  configurations?: string;
  minSizeSqft?: number;
  maxSizeSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  builder?: string;
  configurationDetails?: ConfigurationDetail[];
  // Keep original fields for reference
  RERA_Number?: string;
  ProjectName?: string;
  BuilderName?: string;
  Area?: string;
  Possession_date?: string;
  Price_per_sft?: number;
}

/**
 * Transform raw property data to match the database schema
 */
export function transformPropertyData(rawData: RawPropertyData): TransformedPropertyData {
  const {
    RERA_Number,
    ProjectName,
    BuilderName,
    Area,
    Possession_date,
    Price_per_sft,
    configurations
  } = rawData;

  // Extract configuration information
  const configDetails = configurations || [];
  const uniqueTypes = [...new Set(configDetails.map(config => config.type))];
  const sizeRanges = configDetails.map(config => config.sizeRange);
  const prices = configDetails.map(config => config.BaseProjectPrice);

  // Calculate derived values
  const minSizeSqft = sizeRanges.length > 0 ? Math.min(...sizeRanges) : undefined;
  const maxSizeSqft = sizeRanges.length > 0 ? Math.max(...sizeRanges) : undefined;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Extract bedroom count from configuration types
  const bedroomCounts = uniqueTypes.map(type => {
    const match = type.match(/(\d+)\s*BHK/);
    return match ? parseInt(match[1]) : 0;
  });
  const maxBedrooms = bedroomCounts.length > 0 ? Math.max(...bedroomCounts) : undefined;

  // Create configurations string
  const configurationsString = uniqueTypes.join(', ');

  // Determine property type based on configurations
  let propertyType = 'Residential';
  if (uniqueTypes.some(type => type.includes('Commercial') || type.includes('Office'))) {
    propertyType = 'Commercial';
  } else if (uniqueTypes.some(type => type.includes('Plot') || type.includes('Land'))) {
    propertyType = 'Plot';
  }

  return {
    // Standardized fields
    reraNumber: RERA_Number,
    projectName: ProjectName || 'Unknown Project',
    developerName: BuilderName,
    location: Area || 'Unknown Location',
    possessionDate: Possession_date,
    pricePerSqft: Price_per_sft,
    propertyType,
    name: ProjectName || 'Unknown Project',
    price: minPrice,
    configurations: configurationsString,
    minSizeSqft,
    maxSizeSqft,
    bedrooms: maxBedrooms,
    bathrooms: maxBedrooms ? Math.max(1, Math.floor(maxBedrooms / 2)) : undefined, // Estimate bathrooms
    area: minSizeSqft || 0,
    builder: BuilderName,
    configurationDetails: configDetails,
    // Original fields for reference
    RERA_Number,
    ProjectName,
    BuilderName,
    Area,
    Possession_date,
    Price_per_sft
  };
}

/**
 * API endpoint to transform and import property data
 */
export async function transformAndImportProperties(req: Request, res: Response) {
  try {
    const { properties } = req.body;

    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({
        success: false,
        error: 'Properties array is required'
      });
    }

    console.log(`🔄 Starting transformation and import of ${properties.length} properties...`);

    const results = {
      total: properties.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < properties.length; i++) {
      const rawProperty = properties[i];
      
      try {
        // Transform the property data
        const transformedProperty = transformPropertyData(rawProperty);
        
        // Import to database
        await mongodbStorage.createProperty(transformedProperty);
        
        results.successful++;
        console.log(`✅ Imported: ${transformedProperty.projectName}`);
        
      } catch (error) {
        results.failed++;
        const errorMessage = `Error importing property ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    console.log(`🎉 Import completed: ${results.successful} successful, ${results.failed} failed`);

    return res.status(200).json({
      success: true,
      message: 'Property transformation and import completed',
      results
    });

  } catch (error) {
    console.error('Error in transform and import:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to transform and import properties',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * API endpoint to transform property data without importing
 */
export async function transformPropertyDataOnly(req: Request, res: Response) {
  try {
    const { properties } = req.body;

    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({
        success: false,
        error: 'Properties array is required'
      });
    }

    console.log(`🔄 Transforming ${properties.length} properties...`);

    const transformedProperties = properties.map((rawProperty, index) => {
      try {
        return transformPropertyData(rawProperty);
      } catch (error) {
        console.error(`Error transforming property ${index + 1}:`, error);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ Transformed ${transformedProperties.length} properties successfully`);

    return res.status(200).json({
      success: true,
      message: 'Property transformation completed',
      transformedProperties,
      stats: {
        total: properties.length,
        transformed: transformedProperties.length,
        failed: properties.length - transformedProperties.length
      }
    });

  } catch (error) {
    console.error('Error in property transformation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to transform properties',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Utility function to validate property data structure
 */
export function validatePropertyData(property: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!property.ProjectName) {
    errors.push('ProjectName is required');
  }

  if (!property.Area) {
    errors.push('Area is required');
  }

  if (!property.configurations || !Array.isArray(property.configurations)) {
    errors.push('configurations must be an array');
  }

  if (property.configurations && Array.isArray(property.configurations)) {
    property.configurations.forEach((config: any, index: number) => {
      if (!config.type) {
        errors.push(`Configuration ${index + 1}: type is required`);
      }
      if (!config.sizeRange || typeof config.sizeRange !== 'number') {
        errors.push(`Configuration ${index + 1}: sizeRange must be a number`);
      }
      if (!config.BaseProjectPrice || typeof config.BaseProjectPrice !== 'number') {
        errors.push(`Configuration ${index + 1}: BaseProjectPrice must be a number`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * API endpoint to validate property data
 */
export async function validateProperties(req: Request, res: Response) {
  try {
    const { properties } = req.body;

    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({
        success: false,
        error: 'Properties array is required'
      });
    }

    console.log(`🔍 Validating ${properties.length} properties...`);

    const validationResults = properties.map((property, index) => {
      const validation = validatePropertyData(property);
      return {
        index: index + 1,
        projectName: property.ProjectName || 'Unknown',
        isValid: validation.isValid,
        errors: validation.errors
      };
    });

    const validCount = validationResults.filter(result => result.isValid).length;
    const invalidCount = validationResults.length - validCount;

    console.log(`✅ Validation completed: ${validCount} valid, ${invalidCount} invalid`);

    return res.status(200).json({
      success: true,
      message: 'Property validation completed',
      validationResults,
      stats: {
        total: properties.length,
        valid: validCount,
        invalid: invalidCount
      }
    });

  } catch (error) {
    console.error('Error in property validation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate properties',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 