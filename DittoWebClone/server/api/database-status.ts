// import { Request, Response } from 'express';
// import { supabase, testSupabaseConnection, supabaseConfig } from '../supabase-config';

// export async function getDatabaseStatus(req: Request, res: Response) {
//   try {
//     console.log('🔍 Checking database status...');
    
//     // Basic configuration check
//     const configStatus = {
//       hasUrl: !!supabaseConfig.url,
//       hasKey: !!supabaseConfig.key,
//       url: supabaseConfig.url,
//       keyPreview: supabaseConfig.key,
//       hasCredentials: supabaseConfig.hasCredentials
//     };
    
//     console.log('📋 Configuration status:', configStatus);
    
//     // Test connection
//     const connectionTest = await testSupabaseConnection();
    
//     // Try to get some basic stats if connection is successful
//     let tableStats = null;
//     if (connectionTest.success) {
//       try {
//         const { count, error } = await supabase
//           .from('document_metadata')
//           .select('*', { count: 'exact', head: true });
        
//         if (!error) {
//           tableStats = {
//             totalRecords: count || 0,
//             tableName: 'document_metadata'
//           };
//         }
//       } catch (statsError) {
//         console.error('Error getting table stats:', statsError);
//       }
//     }
    
//     const status = {
//       timestamp: new Date().toISOString(),
//       configuration: configStatus,
//       connection: connectionTest,
//       tableStats,
//       suggestions: []
//     };
    
//     // Add suggestions based on the status
//     if (!configStatus.hasCredentials) {
//       status.suggestions.push('Set SUPABASE_URL and SUPABASE_KEY environment variables');
//     }
    
//     if (!connectionTest.success) {
//       if (connectionTest.error?.includes('DNS resolution failed')) {
//         status.suggestions.push('Check if the Supabase project is active and the URL is correct');
//         status.suggestions.push('Verify your internet connection');
//       } else if (connectionTest.error?.includes('Authentication failed')) {
//         status.suggestions.push('Check if your SUPABASE_KEY is correct and not expired');
//       }
//     }
    
//     console.log('📊 Database status check completed');
    
//     res.json(status);
    
//   } catch (error: any) {
//     console.error('Error checking database status:', error);
//     res.status(500).json({
//       error: 'Failed to check database status',
//       details: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// } 