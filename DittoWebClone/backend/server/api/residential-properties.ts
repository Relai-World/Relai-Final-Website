import { Request, Response } from 'express';
import { Property } from '../../shared/mongodb-schemas';

export async function getResidentialProperties(req: Request, res: Response) {
  try {
    console.log('Fetching residential properties (Apartment and Villa) from MongoDB...');
    
    // Fetch properties with propertyType = 'Apartment' OR 'Villa'
    const properties = await Property.find({ 
      propertyType: { $in: ['Apartment', 'Villa'] } 
    });
    
    if (!properties || properties.length === 0) {
      console.log('No properties found');
      return res.json({ properties: [], total: 0 });
    }
    
    console.log(`Found ${properties.length} residential properties`);
    
    // Transform the data to match the expected format
    const transformedProperties = properties.map((property: any) => ({
      id: property._id,
      developerName: property.developerName || '',
      reraNumber: property.reraNumber || '',
      projectName: property.projectName || '',
      constructionStatus: property.constructionStatus || '',
      propertyType: property.propertyType || '',
      location: property.location || '',
      possessionDate: property.possessionDate || '',
      isGatedCommunity: property.isGatedCommunity || '',
      totalUnits: property.totalUnits || '',
      areaSizeAcres: property.areaSizeAcres || '',
      configurations: property.configurations || '',
      minSizeSqft: parseInt(property.minSizeSqft || '0', 10),
      maxSizeSqft: parseInt(property.maxSizeSqft || '0', 10),
      pricePerSqft: parseFloat(property.pricePerSqft || '0'),
      pricePerSqftOTP: parseFloat(property.pricePerSqftOTP || '0'),
      price: parseFloat(property.price || '0'),
      longitude: parseFloat(property.longitude || '0'),
      latitude: parseFloat(property.latitude || '0'),
      projectDocumentsLink: property.projectDocumentsLink || '',
      source: property.source || '',
      builderContactInfo: property.builderContactInfo || '',
      listingType: property.listingType || '',
      loanApprovedBanks: property.loanApprovedBanks || '',
      nearbyLocations: property.nearbyLocations || '',
      remarksComments: property.remarksComments || '',
      amenities: property.amenities || '',
      faq: property.faq || '',
      name: property.projectName || property.name || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      area: parseInt(property.minSizeSqft || property.area || '0', 10),
      description: property.description || '',
      features: property.features || '',
      images: property.images || [],
      builder: property.builder || '',
      possession: property.possession || '',
      rating: 4.2, // Default rating
      legalClearance: property.legalClearance || '',
      constructionQuality: property.constructionQuality || '',
      waterSupply: property.waterSupply || '',
      powerBackup: property.powerBackup || '',
      parkingFacilities: property.parkingFacilities || '',
      communityType: property.communityType || '',
      buildQuality: property.buildQuality || '',
      investmentPotential: property.investmentPotential || '',
      propertyAge: property.propertyAge || '',
      environmentalFeatures: property.environmentalFeatures || '',
      views: property.views || '',
      noiseLevel: property.noiseLevel || '',
      connectivityAndTransit: property.connectivityAndTransit || '',
      medicalFacilities: property.medicalFacilities || '',
      educationalInstitutions: property.educationalInstitutions || '',
      shoppingAndEntertainment: property.shoppingAndEntertainment || '',
      specialFeatures: property.specialFeatures || '',
      videoTour: property.videoTour || '',
      virtualTour: property.virtualTour || '',
      siteVisitSchedule: property.siteVisitSchedule || '',
      homeLoans: property.homeLoans || '',
      maintenanceCharges: property.maintenanceCharges || '',
      taxAndCharges: property.taxAndCharges || '',
      legalDocuments: property.legalDocuments || '',
      floorPlans: property.floorPlans || '',
      masterPlan: property.masterPlan || '',
      relaiRating: property.relaiRating || '',
      relaiReview: property.relaiReview || '',
      discounts: property.discounts || '',
      bookingAmount: property.bookingAmount || '',
      paymentSchedule: property.paymentSchedule || '',
      minimumBudget: parseFloat(property.minimumBudget || '0'),
      maximumBudget: parseFloat(property.maximumBudget || '0'),
      createdAt: property.createdAt || '',
      updatedAt: property.updatedAt || ''
    }));
    
    // Log some sample data for debugging
    console.log('Sample transformed property:', transformedProperties[0]);
    console.log(`Property types found: ${[...new Set(transformedProperties.map(p => p.propertyType))].join(', ')}`);
    
    res.json({ 
      properties: transformedProperties, 
      total: transformedProperties.length 
    });
    
  } catch (error) {
    console.error('Error fetching residential properties:', error);
    res.status(500).json({ 
      error: 'Failed to fetch residential properties', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}