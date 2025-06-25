const mongoose = require('mongoose');

async function fixDuplicates() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://subscriptions:Subcribe%40Mongodb@cluster0.vynzql2.mongodb.net/Relai?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Get the Property collection directly
    const Property = mongoose.model('Property', new mongoose.Schema({}));

    // Find documents with duplicate project names and locations
    const duplicates = await Property.aggregate([
      {
        $match: {
          projectName: { $ne: null, $ne: '' },
          location: { $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: { 
            projectName: '$projectName', 
            location: '$location' 
          },
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

    console.log(`Found ${duplicates.length} duplicate project groups`);

    // Fix duplicate project groups
    for (const duplicate of duplicates) {
      const docsToUpdate = duplicate.docs.slice(1); // Keep the first one, update the rest
      for (const docId of docsToUpdate) {
        // Add a suffix to make the project name unique
        const doc = await Property.findById(docId);
        if (doc) {
          const newProjectName = `${doc.projectName} (Duplicate ${Date.now()})`;
          await Property.findByIdAndUpdate(docId, { 
            projectName: newProjectName,
            name: newProjectName // Also update the name field
          });
          console.log(`Updated duplicate document ${docId} with projectName: ${newProjectName}`);
        }
      }
    }

    // Find documents with missing required fields
    const missingFields = await Property.find({
      $or: [
        { projectName: { $exists: false } },
        { projectName: null },
        { projectName: '' },
        { location: { $exists: false } },
        { location: null },
        { location: '' }
      ]
    });

    console.log(`Found ${missingFields.length} documents with missing required fields`);

    // Update documents with missing fields
    for (const doc of missingFields) {
      const updates = {};
      
      if (!doc.projectName || doc.projectName === '') {
        updates.projectName = `Unknown Project ${Date.now()}`;
        updates.name = updates.projectName;
      }
      
      if (!doc.location || doc.location === '') {
        updates.location = 'Unknown Location';
      }
      
      if (Object.keys(updates).length > 0) {
        await Property.findByIdAndUpdate(doc._id, updates);
        console.log(`Updated ${doc._id} with missing fields:`, updates);
      }
    }

    console.log('Fix completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixDuplicates(); 