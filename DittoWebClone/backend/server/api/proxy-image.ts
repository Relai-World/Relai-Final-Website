import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function proxyImageHandler(req: Request, res: Response) {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      console.error('[Proxy Image] Missing or invalid URL parameter');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`[Proxy Image] Fetching: ${url}`);

    // Fetch the image from the external URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      // @ts-ignore - Node.js 18+ has fetch with timeout
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      console.error(`[Proxy Image] Failed to fetch image: ${response.status} ${response.statusText}`);
      console.error(`[Proxy Image] Response headers:`, Object.fromEntries(response.headers.entries()));
      return res.status(response.status).json({ 
        error: 'Failed to fetch image',
        status: response.status,
        statusText: response.statusText,
        url: url
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type');
    console.log(`[Proxy Image] Content-Type: ${contentType}`);
    
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`[Proxy Image] Invalid content type: ${contentType}`);
      return res.status(400).json({ 
        error: 'Invalid content type',
        contentType: contentType,
        url: url
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Proxy-Source', 'relai-proxy');

    // Stream the image data to the response
    if (response.body) {
      response.body.pipe(res);
      console.log(`[Proxy Image] Successfully streaming image: ${contentType}`);
    } else {
      // Fallback: get the buffer and send it
      console.log(`[Proxy Image] Using buffer fallback for image`);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      console.log(`[Proxy Image] Successfully sent buffered image: ${contentType}`);
    }

  } catch (error) {
    console.error('[Proxy Image] Error:', error);
    
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Image fetch timeout',
        details: 'The image took too long to load'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to proxy image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 