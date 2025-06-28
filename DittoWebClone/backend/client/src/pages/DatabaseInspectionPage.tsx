import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, Table, Search, Download } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

interface DatabaseTable {
  table_name: string;
  row_count: number;
}

interface PropertyImage {
  id: number;
  property_id: string;
  image_url: string;
  image_type: string;
  image_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DatabaseInspectionPage() {
  const [selectedTable, setSelectedTable] = useState("");
  const [propertyIdSearch, setPropertyIdSearch] = useState("1");
  const { toast } = useToast();

  // Execute raw SQL query to check database tables
  const executeSQLQuery = async (query: string) => {
    const response = await fetch('/api/sql-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`SQL query failed: ${response.status}`);
    }
    
    return response.json();
  };

  // Check if property_images table exists
  const { data: tableCheck, isLoading: tableCheckLoading } = useQuery({
    queryKey: ['database-tables'],
    queryFn: () => executeSQLQuery(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t 
      WHERE table_schema = 'public' 
      AND table_name IN ('property_images', 'properties', 'users', 'contact_inquiries')
      ORDER BY table_name;
    `),
    retry: false,
  });

  // Get property_images table structure
  const { data: tableStructure, isLoading: structureLoading } = useQuery({
    queryKey: ['property-images-structure'],
    queryFn: () => executeSQLQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'property_images' 
      ORDER BY ordinal_position;
    `),
    retry: false,
  });

  // Get sample property images data
  const { data: sampleData, isLoading: sampleLoading } = useQuery({
    queryKey: ['property-images-sample'],
    queryFn: () => executeSQLQuery(`
      SELECT * FROM property_images 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 10;
    `),
    retry: false,
  });

  // Get property images for specific property
  const { data: propertySpecificImages, isLoading: propertyImagesLoading, refetch: refetchPropertyImages } = useQuery({
    queryKey: ['property-specific-images', propertyIdSearch],
    queryFn: () => executeSQLQuery(`
      SELECT * FROM property_images 
      WHERE property_id = '${propertyIdSearch}' 
      AND is_active = true 
      ORDER BY image_order;
    `),
    enabled: !!propertyIdSearch,
    retry: false,
  });

  // Test image fetch for a property
  const testImageFetch = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/property-images/${propertyId}/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Image fetch failed: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image Fetch Test Complete",
        description: `Fetched ${data.images?.length || 0} images for property ${propertyIdSearch}`,
      });
      refetchPropertyImages();
    },
    onError: (error) => {
      toast({
        title: "Image Fetch Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestImageFetch = () => {
    if (!propertyIdSearch.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter a property ID to test image fetching",
        variant: "destructive",
      });
      return;
    }
    testImageFetch.mutate(propertyIdSearch);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Inspection</h1>
          <p className="text-muted-foreground">
            Inspect the property images database structure and verify storage functionality
          </p>
        </div>
      </div>

      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="data">Sample Data</TabsTrigger>
          <TabsTrigger value="test">Test Fetch</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Tables Status
              </CardTitle>
              <CardDescription>
                Current status of key database tables in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tableCheckLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : tableCheck?.rows ? (
                <div className="space-y-4">
                  {tableCheck.rows.map((table: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{table.table_name}</h3>
                        <p className="text-sm text-muted-foreground">{table.column_count} columns</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">EXISTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Unable to fetch table information</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The property_images table may need to be created manually
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                property_images Table Structure
              </CardTitle>
              <CardDescription>
                Column definitions and data types for the property images table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {structureLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : tableStructure?.rows ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Column Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Data Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Nullable</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableStructure.rows.map((column: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{column.column_name}</td>
                          <td className="border border-gray-300 px-4 py-2">{column.data_type}</td>
                          <td className="border border-gray-300 px-4 py-2">{column.is_nullable}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{column.column_default || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">property_images table not found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Run: CREATE TABLE property_images (...) to create the table
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Property Images</CardTitle>
              <CardDescription>
                Latest 10 property images stored in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sampleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : sampleData?.rows && sampleData.rows.length > 0 ? (
                <div className="space-y-4">
                  {sampleData.rows.map((image: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Property ID:</span>
                          <p>{image.property_id}</p>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <p>{image.image_type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Order:</span>
                          <p>{image.image_order}</p>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <p>{new Date(image.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <img 
                          src={image.image_url} 
                          alt={`${image.property_id} - ${image.image_type}`}
                          className="h-24 w-24 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA2NEwzMiA0MEg2NEw0OCA2NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No property images found in database</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use the Test Fetch tab to populate the database with images
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Test Image Fetching
              </CardTitle>
              <CardDescription>
                Test the image fetching system for specific properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPropertyId">Property ID to Test</Label>
                  <Input
                    id="testPropertyId"
                    value={propertyIdSearch}
                    onChange={(e) => setPropertyIdSearch(e.target.value)}
                    placeholder="Enter property ID (1-2046)"
                  />
                </div>
                <Button 
                  onClick={handleTestImageFetch}
                  disabled={testImageFetch.isPending}
                  className="w-full"
                >
                  {testImageFetch.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Images...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Test Image Fetch
                    </>
                  )}
                </Button>
              </div>

              {/* Show images for specific property */}
              <div>
                <h3 className="font-medium mb-3">Images for Property {propertyIdSearch}</h3>
                {propertyImagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : propertySpecificImages?.rows && propertySpecificImages.rows.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {propertySpecificImages.rows.map((image: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">{image.image_type}</div>
                        <img 
                          src={image.image_url} 
                          alt={`Property ${image.property_id} - ${image.image_type}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODRMNzYgNTJIMTI0TDEwMCA4NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR5cGUgY2xhc3M9InN0MiIgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+Cjwvc3ZnPg==';
                          }}
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                          Order: {image.image_order} | Created: {new Date(image.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No images found for property {propertyIdSearch}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Database Connection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Database Type:</strong> PostgreSQL (Neon)</p>
            <p><strong>Table Name:</strong> property_images</p>
            <p><strong>Schema:</strong> public</p>
            <p><strong>Primary Key:</strong> id (auto-increment)</p>
            <p><strong>Image Storage:</strong> URLs stored in database, actual images fetched from Google Maps API</p>
            <p><strong>Maximum Images per Property:</strong> 3 (streetview, satellite, nearby places)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}