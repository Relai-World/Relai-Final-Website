const { MongoClient } = require('mongodb');

async function findPropertiesInBudgetRange() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('relai');
    const collection = db.collection('properties');
    
    // Find properties with BaseProjectPrice between 75L and 1Cr (7,500,000 to 10,000,000)
    const properties = await collection.find({
      'configurations.BaseProjectPrice': {
        $gte: 7500000,
        $lte: 10000000
      }
    }).limit(10).toArray();
    
    console.log(`\nFound ${properties.length} properties within 75L-1Cr budget range:`);
    console.log('=' .repeat(80));
    
    properties.forEach((property, index) => {
      console.log(`\n${index + 1}. Project: ${property.ProjectName || property.projectName}`);
      console.log(`   Builder: ${property.BuilderName || property.builderName || property.developerName}`);
      console.log(`   Location: ${property.Area || property.location}`);
      console.log(`   Configurations:`);
      
      if (property.configurations && Array.isArray(property.configurations)) {
        property.configurations.forEach(config => {
          const priceInLakhs = (config.BaseProjectPrice / 100000).toFixed(2);
          const priceInCrores = (config.BaseProjectPrice / 10000000).toFixed(2);
          console.log(`     - ${config.type}: ₹${priceInLakhs}L (₹${priceInCrores}Cr)`);
        });
      }
      
      console.log(`   Possession: ${property.Possession_date || property.possessionDate}`);
      console.log(`   Price per sqft: ${property.Price_per_sft || property.pricePerSqft}`);
    });
    
    if (properties.length === 0) {
      console.log('\nNo properties found in the 75L-1Cr range.');
      console.log('\nLet\'s check what price ranges exist in the database:');
      
      // Find the min and max prices
      const minPriceResult = await collection.aggregate([
        { $unwind: '$configurations' },
        { $group: { _id: null, minPrice: { $min: '$configurations.BaseProjectPrice' } } }
      ]).toArray();
      
      const maxPriceResult = await collection.aggregate([
        { $unwind: '$configurations' },
        { $group: { _id: null, maxPrice: { $max: '$configurations.BaseProjectPrice' } } }
      ]).toArray();
      
      if (minPriceResult.length > 0 && maxPriceResult.length > 0) {
        const minPrice = minPriceResult[0].minPrice;
        const maxPrice = maxPriceResult[0].maxPrice;
        console.log(`\nPrice range in database: ₹${(minPrice/100000).toFixed(2)}L to ₹${(maxPrice/10000000).toFixed(2)}Cr`);
      }
      
      // Find some sample properties with their prices
      const sampleProperties = await collection.aggregate([
        { $unwind: '$configurations' },
        { $sort: { 'configurations.BaseProjectPrice': 1 } },
        { $limit: 5 }
      ]).toArray();
      
      console.log('\nSample properties with lowest prices:');
      sampleProperties.forEach((item, index) => {
        const priceInLakhs = (item.configurations.BaseProjectPrice / 100000).toFixed(2);
        const priceInCrores = (item.configurations.BaseProjectPrice / 10000000).toFixed(2);
        console.log(`${index + 1}. ${item.ProjectName || item.projectName}: ₹${priceInLakhs}L (₹${priceInCrores}Cr)`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

findPropertiesInBudgetRange(); 