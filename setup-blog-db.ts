import { db } from "./server/db";
import { blogPosts, blogCategories, blogAdmins, adminSessions } from "./shared/schema";
import bcrypt from "bcrypt";

async function setupBlogDatabase() {
  try {
    console.log("Setting up blog database...");

    // Create a default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    try {
      await db.insert(blogAdmins).values({
        username: "admin",
        password: hashedPassword,
      });
      console.log("✓ Created default admin user (username: admin, password: admin123)");
    } catch (error) {
      console.log("Admin user already exists or error creating:", error);
    }

    // Create default categories
    const categories = [
      { name: "Real Estate", slug: "real-estate", description: "Latest trends and insights in real estate" },
      { name: "Investment Tips", slug: "investment-tips", description: "Smart investment strategies for property buyers" },
      { name: "Market Analysis", slug: "market-analysis", description: "In-depth analysis of property markets" },
      { name: "NRI Guide", slug: "nri-guide", description: "Complete guide for NRI property investments" }
    ];

    for (const category of categories) {
      try {
        await db.insert(blogCategories).values(category);
        console.log(`✓ Created category: ${category.name}`);
      } catch (error) {
        console.log(`Category ${category.name} already exists or error:`, error);
      }
    }

    // Create a sample blog post
    try {
      await db.insert(blogPosts).values({
        title: "Welcome to Relai Blog",
        slug: "welcome-to-relai-blog",
        excerpt: "Discover the latest insights, trends, and expert advice in real estate investment with Relai.",
        content: `
# Welcome to Relai Blog

We're excited to launch our blog where we'll share valuable insights about real estate investment, market trends, and expert advice to help you make informed property decisions.

## What You'll Find Here

- **Market Analysis**: Deep dives into property market trends
- **Investment Tips**: Strategies to maximize your property returns
- **NRI Guidance**: Specialized advice for overseas investors
- **Industry News**: Latest developments in real estate

Stay tuned for regular updates and expert insights from our team!
        `,
        status: "published",
        authorId: 1,
        publishedAt: new Date(),
      });
      console.log("✓ Created sample blog post");
    } catch (error) {
      console.log("Sample post already exists or error:", error);
    }

    console.log("Blog database setup completed!");
    console.log("\nAdmin Login Details:");
    console.log("- URL: /admin/login");
    console.log("- Username: admin");
    console.log("- Password: admin123");
    
  } catch (error) {
    console.error("Error setting up blog database:", error);
  }
}

// Run the setup
setupBlogDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});