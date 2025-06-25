/**
 * Client-side geocoding utility
 * Makes API calls to the server's geocoding endpoint
 */

export interface GeocodeResult {
  lat: number;
  lon: number;
}

/**
 * Geocodes an address using the server's geocoding API
 * @param address - The address to geocode
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  console.log('geocodeAddress called with address:', address);
  try {
    console.log(`Geocoding address: ${address}`);
    
    // Make API call to server's geocoding endpoint
    const response = await fetch(`/api/geocode?location=${encodeURIComponent(address)}`);
    
    if (!response.ok) {
      console.error(`Geocoding failed for ${address}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Geocoding API response data:', data);
    
    if (data && data.lat && data.lng) {
      console.log(`Successfully geocoded ${address}: ${data.lat}, ${data.lng}`);
      return {
        lat: data.lat,
        lon: data.lng
      };
    } else {
      console.error(`Invalid geocoding response for ${address}:`, data);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding address ${address}:`, error);
    return null;
  }
}

/**
 * Geocodes multiple addresses in batch
 * @param addresses - Array of addresses to geocode
 * @returns Promise with array of geocoding results
 */
export async function geocodeAddresses(addresses: string[]): Promise<(GeocodeResult | null)[]> {
  const results = await Promise.all(
    addresses.map(address => geocodeAddress(address))
  );
  return results;
}
