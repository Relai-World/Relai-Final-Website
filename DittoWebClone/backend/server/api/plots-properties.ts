import { Request, Response } from 'express';
import { Property } from '../../shared/mongodb-schemas';

export async function getPlotProperties(req: Request, res: Response) {
  try {
    console.log('Fetching plot properties from MongoDB (propertyType = Plot)...');
    
    // Fetch properties with propertyType = 'Plot' directly from MongoDB
    const properties = await Property.find({ propertyType: 'Plot' });
    
    if (!properties || properties.length === 0) {
      console.log('No plot properties found');
      return res.json({ properties: [], total: 0 });
    }
    
    console.log(`Found ${properties.length} plot properties`);
    
    // Transform the data to match frontend interface
    const transformedProperties = properties.map((property: any) => ({
      id: property._id,
      developerName: property.developerName,
      reraNumber: property.reraNumber,
      projectName: property.projectName,
      constructionStatus: property.constructionStatus,
      propertyType: property.propertyType,
      location: property.location,
      possessionDate: property.possessionDate,
      isGatedCommunity: property.isGatedCommunity,
      totalUnits: property.totalUnits,
      areaSizeAcres: property.areaSizeAcres,
      configurations: property.configurations,
      minSizeSqft: property.minSizeSqft,
      maxSizeSqft: property.maxSizeSqft,
      pricePerSqft: property.pricePerSqft,
      pricePerSqftOTP: property.pricePerSqftOTP,
      price: property.price,
      longitude: property.longitude,
      latitude: property.latitude,
      projectDocumentsLink: property.projectDocumentsLink,
      source: property.source,
      builderContactInfo: property.builderContactInfo,
      listingType: property.listingType,
      loanApprovedBanks: property.loanApprovedBanks,
      nearbyLocations: property.nearbyLocations,
      remarksComments: property.remarksComments,
      amenities: property.amenities,
      faq: property.faq,
      name: property.name,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      description: property.description,
      features: property.features,
      images: property.images,
      builder: property.builder,
      possession: property.possession,
      rating: property.rating,
      legalClearance: property.legalClearance,
      constructionQuality: property.constructionQuality,
      waterSupply: property.waterSupply,
      powerBackup: property.powerBackup,
      parkingFacilities: property.parkingFacilities,
      communityType: property.communityType,
      buildQuality: property.buildQuality,
      investmentPotential: property.investmentPotential,
      propertyAge: property.propertyAge,
      environmentalFeatures: property.environmentalFeatures,
      views: property.views,
      noiseLevel: property.noiseLevel,
      connectivityAndTransit: property.connectivityAndTransit,
      medicalFacilities: property.medicalFacilities,
      educationalInstitutions: property.educationalInstitutions,
      shoppingAndEntertainment: property.shoppingAndEntertainment,
      specialFeatures: property.specialFeatures,
      videoTour: property.videoTour,
      virtualTour: property.virtualTour,
      siteVisitSchedule: property.siteVisitSchedule,
      homeLoans: property.homeLoans,
      maintenanceCharges: property.maintenanceCharges,
      taxAndCharges: property.taxAndCharges,
      legalDocuments: property.legalDocuments,
      floorPlans: property.floorPlans,
      masterPlan: property.masterPlan,
      relaiRating: property.relaiRating,
      relaiReview: property.relaiReview,
      discounts: property.discounts,
      bookingAmount: property.bookingAmount,
      paymentSchedule: property.paymentSchedule,
      minimumBudget: property.minimumBudget,
      maximumBudget: property.maximumBudget,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));
    
    res.json({ 
      properties: transformedProperties,
      total: transformedProperties.length
    });
    
  } catch (error: any) {
    console.error('Error fetching plot properties:', error);
    res.status(500).json({ 
      error: 'Failed to fetch plot properties',
      details: error.message 
    });
  }
}