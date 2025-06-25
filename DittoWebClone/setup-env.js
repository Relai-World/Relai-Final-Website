#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for DittoWebClone...\n');

// Current Supabase credentials (from the hardcoded values)
const currentCredentials = {
  SUPABASE_URL: 'https://sshlgndtfgcetserjfow.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGxnbmR0ZmdjZXRzZXJqZm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwOTkzNiwiZXhwIjoyMDYzNDg1OTM2fQ.JgQPgcUhWcIP5NQfXDBGAJbiiJ4ulbhkNhQ5b6t-lG8'
};

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists. Backing up to .env.backup...');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
}

// Create .env file content
const envContent = `# Supabase Configuration
SUPABASE_URL=${currentCredentials.SUPABASE_URL}
SUPABASE_KEY=${currentCredentials.SUPABASE_KEY}

# Database Configuration (if using separate database)
DATABASE_URL=your_database_url_here

# Google Maps API Key (if needed)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Environment
NODE_ENV=development
`;

// Write .env file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('\n📋 Environment variables configured:');
  console.log(`   SUPABASE_URL: ${currentCredentials.SUPABASE_URL}`);
  console.log(`   SUPABASE_KEY: ${currentCredentials.SUPABASE_KEY.substring(0, 20)}...`);
  console.log('\n⚠️  IMPORTANT: The current Supabase project appears to be inactive or deleted.');
  console.log('   You may need to:');
  console.log('   1. Check if the Supabase project is still active');
  console.log('   2. Create a new Supabase project if needed');
  console.log('   3. Update the SUPABASE_URL and SUPABASE_KEY in the .env file');
  console.log('\n🔍 To test the connection, visit: http://localhost:5000/api/database-status');
  console.log('\n🚀 You can now start the server with: npm run dev');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  console.log('\n📝 Please create a .env file manually with the following content:');
  console.log(envContent);
}

console.log('\n📚 Next steps:');
console.log('1. Verify your Supabase project is active');
console.log('2. Update credentials if needed');
console.log('3. Start the server: npm run dev');
console.log('4. Test connection: http://localhost:5000/api/database-status'); 