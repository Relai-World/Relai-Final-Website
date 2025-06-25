// Smart property rating calculation using authentic data
export interface PropertyRating {
  overall: number;
  breakdown: {
    location: number;
    value: number;
    construction: number;
    amenities: number;
    connectivity: number;
  };
  factors: string[];
}

export function calculatePropertyRating(property: any): PropertyRating {
  const factors: string[] = [];
  let locationScore = 3.0;
  let valueScore = 3.0;
  let constructionScore = 3.0;
  let amenitiesScore = 3.0;
  let connectivityScore = 3.0;

  // Location-based scoring
  const location = property.location?.toLowerCase() || '';
  if (['gachibowli', 'hitech city', 'madhapur', 'kondapur'].some(area => location.includes(area))) {
    locationScore = 4.5;
    factors.push('Prime IT corridor location');
  } else if (['banjara hills', 'jubilee hills', 'film nagar'].some(area => location.includes(area))) {
    locationScore = 4.8;
    factors.push('Premium residential area');
  } else if (['kukatpally', 'miyapur', 'bachupally'].some(area => location.includes(area))) {
    locationScore = 4.2;
    factors.push('Well-developed suburban area');
  } else if (['secunderabad', 'begumpet', 'ameerpet'].some(area => location.includes(area))) {
    locationScore = 4.0;
    factors.push('Central business district');
  }

  // Value-based scoring (budget-based analysis)
  const minBudget = property['Min Budget'];
  const maxBudget = property['Max Budget'];
  if (minBudget && maxBudget) {
    const avgBudget = (parseInt(minBudget.toString().replace(/[^0-9]/g, '')) + parseInt(maxBudget.toString().replace(/[^0-9]/g, ''))) / 2;
    if (avgBudget < 40000000) { // Under 4 crores
      valueScore = 4.5;
      factors.push('Excellent value for money');
    } else if (avgBudget < 80000000) { // Under 8 crores
      valueScore = 3.5;
      factors.push('Fair value');
    } else {
      valueScore = 3.0;
      factors.push('Premium pricing');
    }
  }

  // Construction quality based on developer reputation
  const developer = property.developerName?.toLowerCase() || '';
  if (['brigade', 'prestige', 'sobha', 'godrej', 'ramky'].some(dev => developer.includes(dev))) {
    constructionScore = 4.7;
    factors.push('Renowned developer');
  } else if (['aparna', 'my home', 'vamsiram'].some(dev => developer.includes(dev))) {
    constructionScore = 4.3;
    factors.push('Established developer');
  }

  // RERA compliance bonus
  if (property.RERA_Number && property.RERA_Number !== 'Not Available') {
    constructionScore += 0.3;
    factors.push('RERA registered');
  }

  // Property type scoring
  const propertyType = property.PropertyType?.toLowerCase() || '';
  if (propertyType.includes('villa') || propertyType.includes('independent')) {
    amenitiesScore = 4.2;
    factors.push('Independent living');
  } else if (propertyType.includes('apartment') && property.TotalUnits) {
    const units = parseInt(property.TotalUnits.toString());
    if (units > 500) {
      amenitiesScore = 4.0;
      factors.push('Large community amenities');
    } else if (units > 200) {
      amenitiesScore = 3.8;
      factors.push('Good community size');
    }
  }

  // Configuration variety bonus
  const configs = property.Configurations?.toLowerCase() || '';
  const configCount = (configs.match(/\d+bhk/g) || []).length;
  if (configCount >= 3) {
    amenitiesScore += 0.2;
    factors.push('Multiple configuration options');
  }

  // Connectivity scoring based on location
  if (['gachibowli', 'hitech city', 'kondapur', 'kukatpally'].some(area => location.includes(area))) {
    connectivityScore = 4.3;
    factors.push('Metro connectivity');
  } else if (['secunderabad', 'begumpet', 'ameerpet'].some(area => location.includes(area))) {
    connectivityScore = 4.5;
    factors.push('Excellent transport links');
  }

  // Possession timeline impact
  const possession = property.PossessionDate?.toLowerCase() || '';
  if (possession.includes('immediate') || possession.includes('ready')) {
    valueScore += 0.3;
    factors.push('Ready to move');
  }

  // Calculate overall rating
  const overall = (locationScore + valueScore + constructionScore + amenitiesScore + connectivityScore) / 5;

  // Ensure ratings are within bounds
  const clamp = (value: number) => Math.min(5.0, Math.max(1.0, value));

  return {
    overall: Math.round(clamp(overall) * 10) / 10,
    breakdown: {
      location: Math.round(clamp(locationScore) * 10) / 10,
      value: Math.round(clamp(valueScore) * 10) / 10,
      construction: Math.round(clamp(constructionScore) * 10) / 10,
      amenities: Math.round(clamp(amenitiesScore) * 10) / 10,
      connectivity: Math.round(clamp(connectivityScore) * 10) / 10,
    },
    factors: factors.slice(0, 3) // Top 3 factors
  };
}