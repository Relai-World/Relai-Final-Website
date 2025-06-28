const mongoose = require('mongoose');
const { Property } = require('./shared/mongodb-schemas');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://subscriptions:Subcribe%40Mongodb@cluster0.vynzql2.mongodb.net/Relai?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to generate unique propertyId
const generateUniquePropertyId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `PROP_${timestamp}_${random}`;
};

// Function to fix duplicate propertyId issues
const fixPropertyIdDuplicates = async () => {
  try {
    console.log('Starting propertyId duplicate fix...');

    // Step 1: Find all documents with null propertyId
    const nullPropertyIdDocs = await Property.find({ propertyId: null });
    console.log(`Found ${nullPropertyIdDocs.length} documents with null propertyId`);

    // Step 2: Update documents with null propertyId
    for (const doc of nullPropertyIdDocs) {
      const newPropertyId = generateUniquePropertyId();
      await Property.findByIdAndUpdate(doc._id, { propertyId: newPropertyId });
      console.log(`Updated document ${doc._id} with new propertyId: ${newPropertyId}`);
    }

    // Step 3: Find all documents with empty string propertyId
    const emptyPropertyIdDocs = await Property.find({ propertyId: '' });
    console.log(`Found ${emptyPropertyIdDocs.length} documents with empty propertyId`);

    // Step 4: Update documents with empty propertyId
    for (const doc of emptyPropertyIdDocs) {
      const newPropertyId = generateUniquePropertyId();
      await Property.findByIdAndUpdate(doc._id, { propertyId: newPropertyId });
      console.log(`Updated document ${doc._id} with new propertyId: ${newPropertyId}`);
    }

    // Step 5: Find duplicate propertyId values (excluding null and empty)
    const duplicates = await Property.aggregate([
      {
        $match: {
          propertyId: { $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$propertyId',
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`Found ${duplicates.length} duplicate propertyId groups`);

    // Step 6: Fix duplicate propertyId values
    for (const duplicate of duplicates) {
      const docsToUpdate = duplicate.docs.slice(1); // Keep the first one, update the rest
      for (const docId of docsToUpdate) {
        const newPropertyId = generateUniquePropertyId();
        await Property.findByIdAndUpdate(docId, { propertyId: newPropertyId });
        console.log(`Updated duplicate document ${docId} with new propertyId: ${newPropertyId}`);
      }
    }

    console.log('PropertyId duplicate fix completed successfully!');

    // Step 7: Verify the fix
    const remainingNulls = await Property.countDocuments({ propertyId: null });
    const remainingEmpties = await Property.countDocuments({ propertyId: '' });
    const remainingDuplicates = await Property.aggregate([
      {
        $group: {
          _id: '$propertyId',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`Verification results:`);
    console.log(`- Documents with null propertyId: ${remainingNulls}`);
    console.log(`- Documents with empty propertyId: ${remainingEmpties}`);
    console.log(`- Remaining duplicate groups: ${remainingDuplicates.length}`);

  } catch (error) {
    console.error('Error fixing propertyId duplicates:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await fixPropertyIdDuplicates();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error); 