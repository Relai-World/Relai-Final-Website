import { Property } from './PropertyCard';

/**
 * Extracts property information from a markdown formatted string
 * Works with the standard output format from the AI bot
 */
export function parsePropertyInfo(markdown: string): Property[] {
  const properties: Property[] = [];
  
  // Look for property blocks with emoji patterns
  const propertyBlocks = markdown.split('\n\n🏢');
  
  // Skip the first element if it doesn't contain property data
  const startIndex = propertyBlocks[0].includes('🏢') ? 0 : 1;
  
  for (let i = startIndex; i < propertyBlocks.length; i++) {
    let block = propertyBlocks[i];
    
    // Add back the emoji for all but the first block (which might already have it)
    if (i > 0 || startIndex > 0) {
      block = '🏢' + block;
    }
    
    // Extract property name - between 🏢 and the next emoji or newline
    const nameMatch = block.match(/🏢\s*\*\*(.*?)\*\*/);
    if (!nameMatch) continue;
    
    const name = nameMatch[1].trim();
    
    // Extract other details
    const locationMatch = block.match(/📍\s*Location:\s*(.*?)(?=\n|$)/);
    const typeMatch = block.match(/🏠\s*Type:\s*(.*?)(?=\n|$)/);
    const configMatch = block.match(/🔑\s*Configuration:\s*(.*?)(?=\n|$)/);
    const possessionMatch = block.match(/📆\s*Possession:\s*(.*?)(?=\n|$)/);
    const priceMatch = block.match(/💰\s*Price Range:\s*(.*?)(?=\n|$)/);
    const reraMatch = block.match(/📑\s*RERA:\s*(.*?)(?=\n|$)/);
    
    // If we have the core data, create a property object
    if (name) {
      properties.push({
        name,
        location: locationMatch ? locationMatch[1].trim() : 'Unknown',
        type: typeMatch ? typeMatch[1].trim() : 'Unknown',
        configuration: configMatch ? configMatch[1].trim() : 'Unknown',
        possession: possessionMatch ? possessionMatch[1].trim() : 'Unknown',
        priceRange: priceMatch ? priceMatch[1].trim() : 'Unknown',
        rera: reraMatch ? reraMatch[1].trim() : 'Unknown'
      });
    }
  }
  
  return properties;
}

/**
 * Detects if a message contains property listings based on emoji patterns
 */
export function messageContainsProperties(message: string): boolean {
  // Look for common property emoji patterns
  return (
    message.includes('🏢') && 
    (message.includes('📍') || message.includes('🏠') || 
     message.includes('🔑') || message.includes('📆'))
  );
}

