// Test script to demonstrate property data transformation
const sampleData = [
  {
    "_id": {
      "$oid": "685161b58d33afc1876f01e6"
    },
    "RERA_Number": "P02400008439",
    "ProjectName": "HALLMARK ALTUS",
    "BuilderName": "HALLMARK INFRA HEIGHTS LLP",
    "Area": "Kondapur",
    "Possession_date": "01-06-2029",
    "Price_per_sft": 8999,
    "configurations": [
      {
        "type": "3 BHK",
        "sizeRange": 2265,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 20382735
      },
      {
        "type": "3 BHK",
        "sizeRange": 1950,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 17548050
      },
      {
        "type": "3 BHK",
        "sizeRange": 2975,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 26772025
      },
      {
        "type": "3 BHK",
        "sizeRange": 2540,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 22857460
      },
      {
        "type": "3 BHK",
        "sizeRange": 1760,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 15838240
      },
      {
        "type": "3 BHK",
        "sizeRange": 2975,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 26772025
      },
      {
        "type": "4 BHK",
        "sizeRange": 4525,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 40720475
      },
      {
        "type": "4 BHK",
        "sizeRange": 3270,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 29426730
      },
      {
        "type": "4 BHK",
        "sizeRange": 3270,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 29426730
      },
      {
        "type": "4 BHK",
        "sizeRange": 4685,
        "sizeUnit": "Sq ft",
        "facing": "North",
        "BaseProjectPrice": 42160315
      }
    ]
  },
  {
    "_id": {
      "$oid": "685161b58d33afc1876f01e7"
    },
    "RERA_Number": "P02400008419",
    "ProjectName": "VAISHNAOI SOUTHWOODS",
    "BuilderName": "VAISHNAOI DEVELOPERS (INDIA) PRIVATE LIMITED",
    "Area": "Shamshabad",
    "Possession_date": "01-06-2029",
    "Price_per_sft": 12500,
    "configurations": [
      {
        "type": "4&5 BHK",
        "sizeRange": 4259,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 53237500
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 5077,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 63462500
      },
      {
        "type": "4&5 BHK",
        "sizeRange": 6779,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 84737500
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 6815,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 85187500
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 7556,
        "sizeUnit": "Sq ft",
        "facing": "East",
        "BaseProjectPrice": 94450000
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 4433,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 55412500
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 5124,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 64050000
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 6540,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 81750000
      },
      {
        "type": "4 & 5 BHK",
        "sizeRange": 6909,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 86362500
      },
      {
        "type": "4&5 BHK",
        "sizeRange": 7773,
        "sizeUnit": "Sq ft",
        "facing": "West",
        "BaseProjectPrice": 97162500
      }
    ]
  }
];

/**
 * Transform raw property data to match the database schema
 */
function transformPropertyData(rawData) {
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
 * Validate property data structure
 */
function validatePropertyData(property) {
  const errors = [];

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
    property.configurations.forEach((config, index) => {
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

// Test the transformation
console.log('🧪 Testing Property Data Transformation\n');

sampleData.forEach((property, index) => {
  console.log(`\n📋 Property ${index + 1}: ${property.ProjectName}`);
  console.log('=' .repeat(50));
  
  // Validate the data
  const validation = validatePropertyData(property);
  console.log(`✅ Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
  if (!validation.isValid) {
    console.log('❌ Errors:', validation.errors);
  }
  
  // Transform the data
  const transformed = transformPropertyData(property);
  
  console.log('\n🔄 Transformation Results:');
  console.log(`   Project Name: ${transformed.projectName}`);
  console.log(`   Location: ${transformed.location}`);
  console.log(`   Builder: ${transformed.builder}`);
  console.log(`   Property Type: ${transformed.propertyType}`);
  console.log(`   Price Range: ₹${transformed.price.toLocaleString()} - ₹${transformed.maxPrice?.toLocaleString() || 'N/A'}`);
  console.log(`   Size Range: ${transformed.minSizeSqft?.toLocaleString()} - ${transformed.maxSizeSqft?.toLocaleString()} sq ft`);
  console.log(`   Bedrooms: ${transformed.bedrooms || 'N/A'}`);
  console.log(`   Bathrooms: ${transformed.bathrooms || 'N/A'}`);
  console.log(`   Configurations: ${transformed.configurations}`);
  console.log(`   RERA Number: ${transformed.reraNumber}`);
  console.log(`   Possession Date: ${transformed.possessionDate}`);
  console.log(`   Price per sq ft: ₹${transformed.pricePerSqft?.toLocaleString() || 'N/A'}`);
  
  console.log('\n📊 Configuration Details:');
  transformed.configurationDetails?.forEach((config, i) => {
    console.log(`   ${i + 1}. ${config.type} - ${config.sizeRange.toLocaleString()} sq ft - ₹${config.BaseProjectPrice.toLocaleString()}`);
  });
});

console.log('\n🎉 Transformation test completed!');
console.log('\n📝 API Endpoints Available:');
console.log('   POST /api/validate-properties - Validate property data');
console.log('   POST /api/transform-properties - Transform property data only');
console.log('   POST /api/transform-and-import-properties - Transform and import to database'); 