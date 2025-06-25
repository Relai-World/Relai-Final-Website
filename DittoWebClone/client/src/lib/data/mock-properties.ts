// Property type definitions
export type PropertyStatus = 'For Sale' | 'For Rent' | 'Sold' | 'Under Construction';

export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'Office Space';

export type BuilderInfoType = {
  name: string;
  established: string;
  projectsCompleted: number;
  projectsOngoing: number;
  description: string;
  logo?: string;
  rating?: number;
  awards?: string[];
};

export type PropertyGalleryType = {
  images: string[];
  videos?: string[];
  virtualTour?: string;
  floorPlans?: string[];
  brochure?: string;
};

export type PropertyRating = {
  overall: number;
  location: number;
  amenities: number;
  specifications: number;
  valueForMoney: number;
  legalClarity: number;
};

export type PropertyReview = {
  id: string;
  author: {
    name: string;
    image?: string;
    verified: boolean;
  };
  rating: number;
  date: string;
  content: string;
  pros?: string[];
  cons?: string[];
};

export type PropertyDetails = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: {
    amount: number;
    perSqFt?: number;
    currency: string;
    negotiable?: boolean;
  };
  area: {
    total: number;
    covered?: number;
    unit: 'sqft' | 'sqm';
  };
  configuration: {
    bedrooms: number;
    bathrooms: number;
    balconies?: number;
    floors?: number;
    totalFloors?: number;
  };
  amenities: string[];
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    landmarks?: string[];
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  gallery: PropertyGalleryType;
  possession: {
    status: 'Ready to Move' | 'Under Construction';
    expectedDate?: string;
  };
  legalInfo: {
    approvals: string[];
    reraId?: string;
    taxDetails?: {
      propertyTax?: number;
      otherCharges?: number;
    };
    ownershipType: 'Freehold' | 'Leasehold';
    disputeStatus?: string;
  };
  specifications: {
    structure: string;
    walls: string;
    flooring: string;
    kitchen: string;
    bathroom: string;
    doors: string;
    windows: string;
    electrical: string;
  };
  ratings: PropertyRating;
  reviews: PropertyReview[];
  builder: BuilderInfoType;
  investmentPotential: {
    rentalYield?: number;
    appreciationTrend?: string;
    rentalIncome?: {
      monthly: number;
      yearly: number;
    };
    resaleValue?: {
      current: number;
      projectedAfter5Years?: number;
    };
  };
  environmentFactors: {
    greenSpace: string;
    waterConservation: string[];
    wasteManagement: string[];
    airQuality: string;
    noiseLevel: string;
  };
  financing: {
    loanOptions: {
      provider: string;
      interestRate: string;
      maxLoanAmount: number;
      tenure: string;
    }[];
    emiCalculator?: {
      loanAmount: number;
      interestRate: number;
      tenure: number;
      monthlyEmi: number;
    };
  };
  published: Date;
  lastUpdated: Date;
  featured?: boolean;
  verified: boolean;
  visitCount?: number;
};

export const mockProperty: PropertyDetails = {
  id: "prop-123",
  title: "Luxurious 3BHK Apartment in Gachibowli",
  slug: "luxurious-3bhk-apartment-gachibowli",
  description: "Introducing an exquisite 3BHK luxury apartment in the heart of Gachibowli, Hyderabad. This meticulously designed residence offers spacious interiors, premium finishes, and an array of world-class amenities. Located in the thriving IT hub of Hyderabad, the property enjoys proximity to major corporate offices, educational institutions, healthcare facilities, and entertainment options. Experience elevated living with panoramic views, sustainable features, and a vibrant community.",
  type: "Apartment",
  status: "For Sale",
  price: {
    amount: 9500000,
    perSqFt: 6500,
    currency: "INR",
    negotiable: true
  },
  area: {
    total: 1465,
    covered: 1350,
    unit: "sqft"
  },
  configuration: {
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floors: 1,
    totalFloors: 24
  },
  amenities: [
    "Swimming Pool",
    "Gym",
    "Clubhouse",
    "Children's Play Area",
    "Landscaped Gardens",
    "24/7 Security",
    "Power Backup",
    "Covered Parking",
    "Jogging Track",
    "Indoor Games",
    "Badminton Court",
    "Yoga/Meditation Area",
    "Rainwater Harvesting",
    "EV Charging Points",
    "Tennis Court"
  ],
  address: {
    line1: "Elite Heights, Financial District",
    line2: "Nanakramguda",
    city: "Hyderabad",
    state: "Telangana",
    zipCode: "500032",
    country: "India",
    landmarks: ["Next to Amazon Campus", "Near DLF Cybercity"],
    coordinates: {
      latitude: 17.4429,
      longitude: 78.3772
    }
  },
  gallery: {
    images: [
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
      "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg",
      "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
      "https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg",
      "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg"
    ],
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    virtualTour: "https://my.matterport.com/show/?m=LBdpRyCdkhc",
    floorPlans: [
      "https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg"
    ],
    brochure: "https://example.com/brochure.pdf"
  },
  possession: {
    status: "Ready to Move"
  },
  legalInfo: {
    approvals: [
      "GHMC Approved",
      "HMDA Approved",
      "Fire Safety Clearance",
      "Environmental Clearance"
    ],
    reraId: "TELANGANA-RERA-HYD-12345",
    taxDetails: {
      propertyTax: 12000,
      otherCharges: 5000
    },
    ownershipType: "Freehold",
    disputeStatus: "No pending disputes"
  },
  specifications: {
    structure: "RCC framed structure with earthquake-resistant design",
    walls: "AAC blocks with premium quality putty and paint",
    flooring: "Vitrified tiles in living areas, wooden laminate in bedrooms",
    kitchen: "Modular kitchen with granite countertop, stainless steel sink",
    bathroom: "Anti-skid ceramic tiles, premium CP fittings, shower enclosure",
    doors: "Main door: Teak wood, Internal doors: Flush doors with veneer finish",
    windows: "UPVC windows with mosquito mesh and safety grills",
    electrical: "Concealed copper wiring with MCB and ELCB protection"
  },
  ratings: {
    overall: 4.6,
    location: 4.8,
    amenities: 4.7,
    specifications: 4.5,
    valueForMoney: 4.3,
    legalClarity: 4.9
  },
  reviews: [
    {
      id: "rev-1",
      author: {
        name: "Priya Sharma",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
        verified: true
      },
      rating: 5,
      date: "2024-02-15",
      content: "We recently moved into this property and absolutely love it. The amenities are top-notch and the community is fantastic. The builder has paid attention to every detail.",
      pros: [
        "Excellent location",
        "Great community",
        "High-quality construction"
      ],
      cons: [
        "Maintenance charges slightly high"
      ]
    },
    {
      id: "rev-2",
      author: {
        name: "Rahul Gupta",
        verified: true
      },
      rating: 4,
      date: "2024-01-10",
      content: "Good investment property with potential for appreciation. The construction quality is good, but some minor issues with paint work in a few areas. Overall satisfied with my purchase.",
      pros: [
        "Good investment potential",
        "Proximity to IT corridors",
        "Well-designed layout"
      ],
      cons: [
        "Minor finishing issues",
        "Some delay in addressing maintenance requests"
      ]
    }
  ],
  builder: {
    name: "Prestige Group",
    established: "1986",
    projectsCompleted: 250,
    projectsOngoing: 35,
    description: "Prestige Group is one of India's leading real estate developers with a strong presence in residential, commercial, retail, and hospitality sectors. Known for their quality construction and timely delivery, they have transformed the skylines of major Indian cities.",
    rating: 4.7,
    awards: [
      "CREDAI Real Estate Award 2023",
      "ET Real Estate Excellence Award 2022",
      "CNBC Awaaz Real Estate Award"
    ]
  },
  investmentPotential: {
    rentalYield: 3.8,
    appreciationTrend: "7-9% per annum over the last 5 years",
    rentalIncome: {
      monthly: 35000,
      yearly: 420000
    },
    resaleValue: {
      current: 9500000,
      projectedAfter5Years: 12800000
    }
  },
  environmentFactors: {
    greenSpace: "40% of the project area dedicated to landscaping and open spaces",
    waterConservation: [
      "Rainwater harvesting systems",
      "STP with water recycling for landscaping",
      "Water-efficient fixtures reducing consumption by 30%"
    ],
    wasteManagement: [
      "Segregation at source",
      "Composting facilities for organic waste",
      "Tie-up with recycling agencies"
    ],
    airQuality: "AQI typically ranges from 60-90, better than city average",
    noiseLevel: "Well-insulated walls keeping indoor noise levels below 40 dB"
  },
  financing: {
    loanOptions: [
      {
        provider: "HDFC Bank",
        interestRate: "8.50-9.00%",
        maxLoanAmount: 7600000,
        tenure: "Up to 30 years"
      },
      {
        provider: "SBI",
        interestRate: "8.65-9.15%",
        maxLoanAmount: 7600000,
        tenure: "Up to 30 years"
      },
      {
        provider: "ICICI Bank",
        interestRate: "8.75-9.25%",
        maxLoanAmount: 7400000,
        tenure: "Up to 25 years"
      }
    ],
    emiCalculator: {
      loanAmount: 7600000,
      interestRate: 8.75,
      tenure: 20,
      monthlyEmi: 67542
    }
  },
  published: new Date("2024-01-01"),
  lastUpdated: new Date("2024-03-15"),
  featured: true,
  verified: true,
  visitCount: 1258
};