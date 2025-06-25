import { pgTable, text, serial, integer, boolean, doublePrecision, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Contact inquiries table for property expert contact requests
export const contactInquiries = pgTable("contact_inquiries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  meetingTime: timestamp("meeting_time").notNull(),
  propertyName: text("property_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Updated properties table to match the CSV file structure
export const properties = pgTable("properties", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  developerName: text("developer_name"),
  reraNumber: text("rera_number"),
  projectName: text("project_name").notNull(),
  constructionStatus: text("construction_status"),
  propertyType: text("property_type").notNull(),
  location: text("location").notNull(),
  possessionDate: text("possession_date"),
  isGatedCommunity: boolean("is_gated_community").default(false),
  totalUnits: integer("total_units"),
  areaSizeAcres: doublePrecision("area_size_acres"),
  configurations: text("configurations"),
  minSizeSqft: integer("min_size_sqft"),
  maxSizeSqft: integer("max_size_sqft"),
  pricePerSqft: doublePrecision("price_per_sqft"),
  pricePerSqftOTP: doublePrecision("price_per_sqft_otp"),
  price: doublePrecision("price").notNull().default('0'),
  longitude: doublePrecision("longitude"),
  latitude: doublePrecision("latitude"),
  projectDocumentsLink: text("project_documents_link"),
  source: text("source"),
  builderContactInfo: text("builder_contact_info"),
  listingType: text("listing_type"),
  loanApprovedBanks: text("loan_approved_banks").array(),
  nearbyLocations: text("nearby_locations").array(),
  remarksComments: text("remarks_comments"),
  amenities: text("amenities").array(),
  faq: text("faq").array(),
  name: text("name").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: integer("area").notNull().default(0),
  description: text("description"),
  features: text("features").array(),
  images: text("images").array(),
  builder: text("builder"),
  possession: text("possession"),
  rating: doublePrecision("rating"),
  legalClearance: text("legal_clearance"),
  constructionQuality: text("construction_quality"),
  waterSupply: text("water_supply"),
  powerBackup: text("power_backup"),
  parkingFacilities: text("parking_facilities"),
  communityType: text("community_type"),
  buildQuality: text("build_quality"),
  investmentPotential: text("investment_potential"),
  propertyAge: text("property_age"),
  environmentalFeatures: text("environmental_features"),
  views: text("views"),
  noiseLevel: text("noise_level"),
  connectivityAndTransit: text("connectivity_and_transit"),
  medicalFacilities: text("medical_facilities"),
  educationalInstitutions: text("educational_institutions"),
  shoppingAndEntertainment: text("shopping_and_entertainment"),
  specialFeatures: text("special_features").array(),
  videoTour: text("video_tour"),
  virtualTour: text("virtual_tour"),
  siteVisitSchedule: text("site_visit_schedule"),
  homeLoans: text("home_loans"),
  maintenanceCharges: text("maintenance_charges"),
  taxAndCharges: text("tax_and_charges"),
  legalDocuments: text("legal_documents").array(),
  floorPlans: text("floor_plans").array(),
  masterPlan: text("master_plan"),
  relaiRating: doublePrecision("relai_rating"),
  relaiReview: text("relai_review"),
  discounts: text("discounts"),
  bookingAmount: text("booking_amount"),
  paymentSchedule: text("payment_schedule"),
  minimumBudget: doublePrecision("minimum_budget"),
  maximumBudget: doublePrecision("maximum_budget"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property images table to store fetched images
export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull().references(() => properties.id),
  imageUrl: text("image_url").notNull(),
  imageType: text("image_type").notNull(), // 'place_photo', 'street_view', 'satellite_map', 'roadmap'
  imageOrder: integer("image_order").notNull().default(1), // Order of images for property
  fetchedAt: timestamp("fetched_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Blog admin users table
export const blogAdmins = pgTable("blog_admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  category: text("category").notNull().default("Real Estate"),
  status: text("status").notNull().default("draft"), // draft, published
  authorId: integer("author_id").references(() => blogAdmins.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog categories table
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog post categories junction table
export const blogPostCategories = pgTable("blog_post_categories", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => blogPosts.id),
  categoryId: integer("category_id").references(() => blogCategories.id),
});

// Admin sessions table for authentication
export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => blogAdmins.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Blog schema types
export const insertBlogAdminSchema = createInsertSchema(blogAdmins).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
});

export type BlogAdmin = typeof blogAdmins.$inferSelect;
export type InsertBlogAdmin = z.infer<typeof insertBlogAdminSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type AdminSession = typeof adminSessions.$inferSelect;

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({
  id: true,
  fetchedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;

export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type PropertyImage = typeof propertyImages.$inferSelect;
