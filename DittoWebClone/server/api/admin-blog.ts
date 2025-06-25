import { Router } from "express";
import { db } from "../db";
import { blogPosts, blogCategories, blogAdmins, adminSessions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const adminBlogRouter = Router();

// Middleware to check admin authentication
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    const [session] = await db
      .select({
        userId: adminSessions.userId,
        expiresAt: adminSessions.expiresAt,
      })
      .from(adminSessions)
      .where(eq(adminSessions.id, token));

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin login
adminBlogRouter.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { body: req.body, headers: req.headers });
    const { username, password } = req.body;

    console.log('Extracted credentials:', { username, password: password ? '***' : 'undefined' });

    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(401).json({ message: 'Username and password are required' });
    }

    // Find admin user
    console.log('Looking for admin user:', username);
    const [admin] = await db
      .select()
      .from(blogAdmins)
      .where(eq(blogAdmins.username, username));

    console.log('Found admin user:', admin ? { id: admin.id, username: admin.username } : 'null');

    if (!admin) {
      console.log('Admin user not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('Comparing password with hash');
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create session
    const sessionId = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('Creating session:', { sessionId: sessionId.substring(0, 8) + '...', expiresAt });

    await db.insert(adminSessions).values({
      id: sessionId,
      userId: admin.id,
      expiresAt,
    });

    console.log('Login successful for user:', admin.username);
    res.json({ token: sessionId, user: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get all posts (including drafts) for admin
adminBlogRouter.get('/posts', requireAuth, async (req, res) => {
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Create new post
adminBlogRouter.post('/posts', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, featuredImage, category, status } = req.body;

    // Check if slug already exists
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (existing) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title,
        slug,
        excerpt,
        content,
        featuredImage: featuredImage || null,
        category: category || "Real Estate",
        status,
        authorId: (req as any).userId,
        publishedAt,
      })
      .returning();

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Update post
adminBlogRouter.put('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, featuredImage, category, status } = req.body;

    // Check if slug already exists for other posts
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (existing && existing.id !== parseInt(id)) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        title,
        slug,
        excerpt,
        content,
        featuredImage: featuredImage || null,
        category: category || "Real Estate",
        status,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Delete post
adminBlogRouter.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Get all categories for admin
adminBlogRouter.get('/categories', requireAuth, async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(blogCategories)
      .orderBy(blogCategories.name);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Create category
adminBlogRouter.post('/categories', requireAuth, async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    const [newCategory] = await db
      .insert(blogCategories)
      .values({ name, slug, description })
      .returning();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});