import fetch from 'node-fetch';
import { proxyImageHandler } from "./api/proxy-image";

async function testProxyImage() {
  try {
    // Test with a simple image URL first
    const testUrl = 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Test+Image';
    const proxyUrl = `http://localhost:5000/api/proxy-image?url=${encodeURIComponent(testUrl)}`;
    
    console.log('Testing proxy image endpoint...');
    console.log('Original URL:', testUrl);
    console.log('Proxy URL:', proxyUrl);
    
    const response = await fetch(proxyUrl);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Proxy image endpoint is working!');
      
      // Test with one of the actual Google Maps URLs from your response
      const googleMapsUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AXQCQNSmYUHt0Ijx7XbGlbocatsIbOhGCl_i2-q1WlWiaC0N8InAvKOaNmD-h-QWP5aH6rfKHRngvUrFsJ58RORjnNmPoC6Yj4MWJUA6-WbEKjW5pAgHJpPEw9wlT_tpvLsNMPzjj7kXPHmm2g76aAshj886UtAu62nYQQJwnjF-dEjblaTw-lwNT1JZCFp3_Rv3mx4RFikp6GYJEaiW3Vcl4_1eE9a8L9KaO4E2bel4-pXz7ZprZJM_kEy5Ggr4-uuNAtseH4Ux1foj58aJIPjGv1zSpM9EWJ_Df9NoBPn3F8AmRThKtpHYaRBGyIROV_Lqji7ub3p-1xc&key=AIzaSyDNrcrk7lQYchpASVX0RxY091ltniMpZZU';
      const googleProxyUrl = `http://localhost:5000/api/proxy-image?url=${encodeURIComponent(googleMapsUrl)}`;
      
      console.log('\nTesting with Google Maps URL...');
      console.log('Google Maps URL:', googleMapsUrl);
      console.log('Google Proxy URL:', googleProxyUrl);
      
      const googleResponse = await fetch(googleProxyUrl);
      
      console.log('Google Maps Response status:', googleResponse.status);
      console.log('Google Maps Response headers:', Object.fromEntries(googleResponse.headers.entries()));
      
      if (googleResponse.ok) {
        console.log('✅ Google Maps proxy is working!');
      } else {
        console.log('❌ Google Maps proxy failed');
        const errorText = await googleResponse.text();
        console.log('Error response:', errorText);
      }
    } else {
      console.log('❌ Proxy image endpoint failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProxyImage(); 