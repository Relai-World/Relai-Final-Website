import { Request, Response } from 'express';
import axios from 'axios';

// Your N8N webhook URL from environment variable or a configuration file
// Use the production webhook URL provided by the user
const N8N_WEBHOOK_URL = 'https://navaneeth03.app.n8n.cloud/webhook/my-webhook';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

// Is this a test webhook URL?
const IS_TEST_WEBHOOK = N8N_WEBHOOK_URL.includes('webhook-test');

// Log the webhook configuration at startup for debugging
console.log(`N8n webhook configuration:
- URL: ${N8N_WEBHOOK_URL ? N8N_WEBHOOK_URL.substring(0, 20) + '...[truncated]' : 'Not configured'}
- API Key: ${N8N_API_KEY ? 'Configured' : 'Not configured'}
- Mode: ${IS_TEST_WEBHOOK ? 'Test webhook' : 'Production webhook'}
`);

/**
 * Function to directly test the n8n webhook via GET request
 * This can be useful to isolate whether it's our implementation or the webhook that's problematic
 */
async function testN8nWebhook(message: string, sessionId?: string): Promise<any> {
  try {
    // Build test URL with query parameters
    let testUrl = `${N8N_WEBHOOK_URL}?message=${encodeURIComponent(message)}`;
    
    // Add session ID if available to maintain conversation context
    if (sessionId) {
      testUrl += `&sessionId=${encodeURIComponent(sessionId)}`;
    }
    
    console.log(`Testing direct GET webhook with: ${testUrl}`);
    
    // Make a direct GET request to the webhook
    const response = await axios.get(testUrl);
    console.log('Direct GET webhook test response:', response.data);
    return {
      success: true,
      source: 'direct-test',
      response: response.data
    };
  } catch (error) {
    console.error('Error testing direct webhook:', error);
    return {
      success: false,
      source: 'direct-test',
      error: axios.isAxiosError(error) ? error.response?.data || error.message : String(error)
    };
  }
}

/**
 * Proxy requests to your n8n webhook
 * This avoids exposing your n8n webhook URL directly to the frontend
 * and helps prevent CORS issues
 */
export async function n8nBotProxyHandler(req: Request, res: Response) {
  try {
    // Basic validation
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }
    
    // Make sure the N8N webhook URL is configured
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'AI Assistant is not properly configured. Please try again later.'
      });
    }
    
    // Print the message and session ID for debugging
    if (sessionId) {
      console.log(`Sending message to n8n: "${message}" with sessionId: "${sessionId}"`);
    } else {
      console.log(`Sending message to n8n: "${message}" without sessionId`);
    }
    
    let response;
    
    // Use GET request method as specified by user
    console.log("Using GET approach for n8n webhook");
    let webhookUrl = `${N8N_WEBHOOK_URL}?message=${encodeURIComponent(message)}`;
    
    // Add session ID parameter if available
    if (sessionId) {
      webhookUrl += `&sessionId=${encodeURIComponent(sessionId)}`;
    }
    
    // Add context for better AI responses
    webhookUrl += `&context=property_search&agent=Public%20User`;
    
    console.log(`Calling webhook: ${webhookUrl}`);
    
    try {
      response = await axios.get(webhookUrl, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Relai-AI-Assistant/1.0'
        }
      });
      
      console.log("Webhook response status:", response.status);
      console.log("Webhook response data:", response.data);
    } catch (error) {
      console.error("Error connecting to n8n webhook");
      
      // Log the error for troubleshooting
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      } else {
        console.error("Non-Axios error:", error);
      }
      
      // Rethrow the error to be handled by the outer try/catch
      throw error;
    }
    
    // Process the response based on its format
    let responseMessage = '';
    
    if (response && response.data) {
      console.log('N8n response data type:', typeof response.data);
      
      if (typeof response.data === 'string') {
        // Plain string response
        responseMessage = response.data;
      } else if (typeof response.data === 'object') {
        // Check if the response has an output field (common for n8n)
        if (response.data.output) {
          responseMessage = response.data.output;
        } else {
          // Find the response in the object - try common fields
          responseMessage = response.data.message || 
                            response.data.text || 
                            response.data.response || 
                            response.data.result || 
                            response.data.answer ||
                            JSON.stringify(response.data);
        }
      } else {
        // Fallback for other types
        responseMessage = String(response.data);
      }
    } else {
      // No response data
      responseMessage = "I received your message, but I'm not sure how to respond.";
    }
    
    console.log('Processed response message:', responseMessage);
    
    // Return the processed response to the client
    return res.status(200).json({
      success: true,
      response: responseMessage,
      directTestResult // Include direct test result for debugging
    });
    
  } catch (error) {
    console.error('Error proxying request to n8n:', error);
    
    // Handle different error types
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('n8n API error response:', error.response.data);
        
        // Check for n8n specific error cases
        if (error.response.status === 404 && 
            error.response.data?.message?.includes("webhook") && 
            error.response.data?.hint?.includes("workflow must be active")) {
          
          return res.status(503).json({
            success: false,
            message: 'The AI assistant is currently in maintenance mode. The workflow needs to be activated in n8n.',
            error: error.response.data
          });
        }
        
        // Just pass through the actual error without fallbacks
        if (error.response.status === 404) {
          console.log("Webhook 404 error - returning actual error");
          
          // Return the actual error
          return res.status(error.response.status).json({
            success: false,
            message: error.response.data?.message || "Webhook not found",
            error: error.response.data
          });
        }
        
        return res.status(error.response.status).json({
          success: false,
          message: 'There was an issue processing your request with our AI assistant.',
          error: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from n8n webhook');
        return res.status(504).json({
          success: false,
          message: 'Our AI assistant is not responding right now. Please try again later.'
        });
      }
    }
    
    // Generic error
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your request.'
    });
  }
}