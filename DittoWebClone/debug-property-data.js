// const mongoose = require('mongoose');
// const { Property } = require('./shared/mongodb-schemas');

// // MongoDB connection string - replace with your actual connection string
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relai';

// async function debugPropertyData() {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected to MongoDB');
    
//     const propertyId = '685264ff8d33afc1876f035d'; // Atrium Aruna property
    
//     console.log(`\n🔍 Debugging property data for ID: ${propertyId}`);
    
//     const property = await Property.findById(propertyId).lean();
    
//     if (!property) {
//       console.log('❌ Property not found');
//       return;
//     }
    
//     console.log('\n📋 Property Data:');
//     console.log('Project Name:', property.projectName || property.ProjectName);
//     console.log('Builder Name:', property.builder || property.BuilderName || property.developerName);
//     console.log('Location:', property.location || property.Area);
//     console.log('Price per sqft:', property.pricePerSqft || property.Price_per_sft);
//     console.log('Possession Date:', property.possessionDate || property.Possession_date);
    
//     console.log('\n🔧 Configuration Data:');
//     console.log('configurationDetails:', property.configurationDetails);
//     console.log('configurations (string):', property.configurations);
//     console.log('minSizeSqft:', property.minSizeSqft);
//     console.log('maxSizeSqft:', property.maxSizeSqft);
//     console.log('bedrooms:', property.bedrooms);
//     console.log('bathrooms:', property.bathrooms);
    
//     console.log('\n🖼️ Image Data:');
//     console.log('images count:', property.images?.length || 0);
//     console.log('images:', property.images);
    
//     // Check if we need to populate configuration data
//     if (!property.configurationDetails || property.configurationDetails.length === 0) {
//       console.log('\n⚠️ No configuration details found. Creating sample data...');
      
//       // Create sample configuration data based on typical apartment configurations
//       const sampleConfigurations = [
//         {
//           type: "2 BHK",
//           sizeRange: 1200,
//           sizeUnit: "Sq ft",
//           facing: "East",
//           baseProjectPrice: 1200 * (property.pricePerSqft || property.Price_per_sft || 5000)
//         },
//         {
//           type: "3 BHK",
//           sizeRange: 1800,
//           sizeUnit: "Sq ft",
//           facing: "East",
//           baseProjectPrice: 1800 * (property.pricePerSqft || property.Price_per_sft || 5000)
//         },
//         {
//           type: "3 BHK",
//           sizeRange: 2000,
//           sizeUnit: "Sq ft",
//           facing: "West",
//           baseProjectPrice: 2000 * (property.pricePerSqft || property.Price_per_sft || 5000)
//         }
//       ];
      
//       console.log('Sample configurations to add:', sampleConfigurations);
      
//       // Update the property with configuration data
//       const updateResult = await Property.findByIdAndUpdate(
//         propertyId,
//         {
//           $set: {
//             configurationDetails: sampleConfigurations,
//             minSizeSqft: 1200,
//             maxSizeSqft: 2000,
//             bedrooms: 3,
//             bathrooms: 2
//           }
//         },
//         { new: true }
//       );
      
//       if (updateResult) {
//         console.log('✅ Successfully updated property with configuration data');
//         console.log('Updated configurationDetails:', updateResult.configurationDetails);
//       } else {
//         console.log('❌ Failed to update property');
//       }
//     }
    
//     console.log('\n🎯 Current API Response Format:');
//     const apiResponse = {
//       _id: {
//         $oid: property._id.toString()
//       },
//       RERA_Number: property.RERA_Number || property.reraNumber || '',
//       ProjectName: property.ProjectName || property.projectName || '',
//       BuilderName: property.BuilderName || property.developerName || property.builder || '',
//       Area: property.Area || property.location || '',
//       Possession_date: property.Possession_date || property.possessionDate || property.possession || '',
//       Price_per_sft: property.Price_per_sft || property.pricePerSqft || 0,
//       configurations: property.configurationDetails || property.configurations || [],
//       images: property.images || []
//     };
    
//     console.log(JSON.stringify(apiResponse, null, 2));
    
//   } catch (error) {
//     console.error('❌ Error:', error);
//   } finally {
//     await mongoose.disconnect();
//     console.log('\n🔌 Disconnected from MongoDB');
//   }
// }

// // Run the debug script
// debugPropertyData(); 