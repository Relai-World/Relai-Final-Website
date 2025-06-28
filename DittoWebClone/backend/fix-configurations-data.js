const mongoose = require('mongoose');
const { Property } = require('./shared/mongodb-schemas');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relai_website';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function fixConfigurationsData() {
  try {
    console.log('🔧 Starting configurations data fix...');
    
    // Find all properties that have configurations field
    const properties = await Property.find({ configurations: { $exists: true } });
    console.log(`📊 Found ${properties.length} properties with configurations field`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const property of properties) {
      try {
        const configurations = property.configurations;
        
        // Skip if configurations is already properly formatted
        if (!configurations || Array.isArray(configurations)) {
          skippedCount++;
          continue;
        }
        
        // If configurations is a string, try to parse it
        if (typeof configurations === 'string') {
          try {
            const parsedConfigs = JSON.parse(configurations);
            if (Array.isArray(parsedConfigs)) {
              // Update the property with the parsed array
              await Property.updateOne(
                { _id: property._id },
                { 
                  $set: { 
                    configurations: parsedConfigs,
                    configurationDetails: parsedConfigs 
                  } 
                }
              );
              fixedCount++;
              console.log(`✅ Fixed property: ${property.projectName || property.ProjectName || property.name}`);
            } else {
              console.log(`⚠️  Parsed configurations is not an array for property: ${property.projectName || property.ProjectName || property.name}`);
              errorCount++;
            }
          } catch (parseError) {
            console.log(`⚠️  Could not parse configurations string for property: ${property.projectName || property.ProjectName || property.name}`);
            // If we can't parse it, convert it to a simple string array
            await Property.updateOne(
              { _id: property._id },
              { 
                $set: { 
                  configurations: [configurations],
                  configurationDetails: [{ type: configurations, sizeRange: 0, sizeUnit: 'Sq ft', facing: 'N/A', baseProjectPrice: 0 }]
                } 
              }
            );
            fixedCount++;
            console.log(`✅ Fixed property with string config: ${property.projectName || property.ProjectName || property.name}`);
          }
        } else {
          // If it's some other type, convert to empty array
          await Property.updateOne(
            { _id: property._id },
            { 
              $set: { 
                configurations: [],
                configurationDetails: []
              } 
            }
          );
          fixedCount++;
          console.log(`✅ Fixed property with invalid config type: ${property.projectName || property.ProjectName || property.name}`);
        }
      } catch (propertyError) {
        console.error(`❌ Error fixing property ${property.projectName || property.ProjectName || property.name}:`, propertyError);
        errorCount++;
      }
    }
    
    console.log('\n📊 Fix Summary:');
    console.log(`✅ Fixed: ${fixedCount} properties`);
    console.log(`⏭️  Skipped: ${skippedCount} properties`);
    console.log(`❌ Errors: ${errorCount} properties`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some properties had errors. Check the logs above for details.');
    } else {
      console.log('\n🎉 All configurations data has been successfully fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error in fixConfigurationsData:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
connectDB().then(() => {
  fixConfigurationsData().then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}); 