// Debug script to test Google Maps APIs individually
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDNrcrk7lQYchpASVX0RxY091ltniMpZZU';
console.log(`Testing with API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);

async function testAPI(name, url) {
  try {
    console.log(`\n=== Testing ${name} ===`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response Status: ${data.status || 'No status field'}`);
    
    if (data.error_message) {
      console.log(`Error Message: ${data.error_message}`);
    }
    
    if (data.status === 'REQUEST_DENIED') {
      console.log('❌ REQUEST_DENIED - Check API key restrictions');
    } else if (data.status === 'OK') {
      console.log('✅ API call successful');
    } else {
      console.log(`⚠️ Unexpected status: ${data.status}`);
    }
    
    console.log('Full Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function runTests() {
  if (!API_KEY) {
    console.log('❌ No API key found in environment variables');
    return;
  }

  // Test 1: Geocoding API
  await testAPI(
    'Geocoding API',
    `https://maps.googleapis.com/maps/api/geocode/json?address=Gachibowli,Hyderabad&key=${API_KEY}`
  );

  // Test 2: Places API - Find Place
  await testAPI(
    'Places API - Find Place',
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Gachibowli%20Hyderabad&inputtype=textquery&fields=place_id,name&key=${API_KEY}`
  );

  // Test 3: Places API - Text Search
  await testAPI(
    'Places API - Text Search',
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Gachibowli%20Hyderabad&key=${API_KEY}`
  );

  // Test 4: Street View Static API
  await testAPI(
    'Street View Static API',
    `https://maps.googleapis.com/maps/api/streetview/metadata?location=Gachibowli,Hyderabad&key=${API_KEY}`
  );

  // Test 5: Maps Static API
  await testAPI(
    'Maps Static API',
    `https://maps.googleapis.com/maps/api/staticmap?center=Gachibowli,Hyderabad&zoom=12&size=400x400&key=${API_KEY}`
  );

  console.log('\n=== Debug Complete ===');
  console.log('If all APIs show REQUEST_DENIED, check:');
  console.log('1. API key restrictions in Google Cloud Console');
  console.log('2. Billing account status');
  console.log('3. API quotas and limits');
  console.log('4. Domain/referrer restrictions');
}

runTests();