export const NAVIGATION = {
  properties: {
    title: "Properties",
    items: [
      { label: "All Properties", href: "/properties/all" },
      { label: "Residential Properties", href: "/properties/residential-properties" },
      { label: "Commercial Properties", href: "/properties/commercial-properties" },
      { label: "Plots", href: "/properties/plots" },
    ],
  },
  groupBuying: {
    title: "Group Buying",
    href: "/group-buying",
  },
  nri: {
    title: "NRI Services",
    href: "/nri-services",
  },
  tools: {
    title: "Tools",
    items: [
      { label: "Property Loan Calculator", href: "/tools/loan-calculator" },
      { label: "Area Converter", href: "/tools/area-converter" },
      { label: "Start Comparing Properties", href: "/compare-properties" },
    ],
  },
  blog: {
    title: "Blog",
    href: "/blog",
  },
  aboutUs: {
    title: "About Us",
    href: "/about-us",
  },
  contactUs: {
    title: "Contact Us",
    href: "/contact-us",
  },
};

export const PARTNERS = {
  RESIDENTIAL: {
    name: "Residential Properties",
    logo: "/placeholder-logo.png",
    services: ["Apartments", "Houses", "Villas"],
  },
  COMMERCIAL: {
    name: "Commercial Properties",
    logo: "/placeholder-logo.png",
    services: ["Office Spaces", "Retail Spaces", "Warehouses"],
  },
  INVESTMENT: {
    name: "Investment Options",
    logo: "/placeholder-logo.png",
    services: ["REITs", "Property Funds", "Fractional Ownership"],
  },
};

export const FAQS = [
  {
    question: "What is relai?",
    answer: "We empower home buyers and investors with data-driven insights, expert guidance and seamless property transactions, delivering a transparent, efficient, and hassle-free real estate experience.",
  },
  {
    question: "How does relai help property buyers?",
    answer: "We provide unbaised advisory, comprehensive property listings, personalized search options, guided property tours, and expert assistance throughout the buying process to ensure you find your perfect property.",
  },
];

export const FOOTER_LINKS = {
  propertyServices: [
    { label: "All Properties", href: "/properties/all" },
    { label: "NRI Services", href: "/nri-services" },
    { label: "Group Buying", href: "/group-buying" },
  ],
  company: [
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
  ],
  resources: [
    { label: "Property Loan Calculator", href: "/tools/loan-calculator" },
    { label: "Area Converter", href: "/tools/area-converter" },
  ],
  social: [
    { label: "X", href: "https://x.com/relaiworld", icon: "x" },
    { label: "Instagram", href: "https://www.instagram.com/relai.world/", icon: "instagram" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/relaiworld/", icon: "linkedin" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61575099697345", icon: "facebook" },
  ],
};
