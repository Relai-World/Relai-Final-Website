import { Router } from "express";
import { db } from "../db";
import { blogPosts } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const blogRouter = Router();

// Get all published posts for public viewing
blogRouter.get('/posts', async (req, res) => {
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt));

    // Transform posts to match frontend interface
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt?.toISOString() || '',
      author: 'Relai Team', // Default author
      category: post.category || 'Real Estate'
    }));

    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Get single post by slug
blogRouter.get('/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Transform post to match frontend interface
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt?.toISOString() || '',
      author: 'Relai Team',
      category: post.category || 'Real Estate'
    };

    res.json(transformedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Get categories (for now return static categories)
blogRouter.get('/categories', async (req, res) => {
  try {
    // For now, return default categories
    const categories = [
      { id: 1, name: 'Real Estate', slug: 'real-estate' },
      { id: 2, name: 'Investment Tips', slug: 'investment-tips' },
      { id: 3, name: 'Market Analysis', slug: 'market-analysis' },
      { id: 4, name: 'NRI Guide', slug: 'nri-guide' }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});