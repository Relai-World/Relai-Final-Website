import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Database, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PropertyImage {
  id: number;
  propertyId: string;
  imageUrl: string;
  imageType: string;
  imageOrder: number;
  createdAt: string;
}

interface ImageStats {
  totalImages: number;
  totalProperties: number;
  averageImagesPerProperty: number;
}

export default function PropertyImageTestPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState("1");
  const [bulkFetchCount, setBulkFetchCount] = useState("10");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch images for a specific property
  const { data: propertyImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/property-images', selectedPropertyId],
    enabled: !!selectedPropertyId,
  });

  // Fetch image statistics
  const { data: imageStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/property-images-stats'],
  });

  // Single property image fetch mutation
  const fetchImagesMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/property-images/${propertyId}/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Images Fetched Successfully",
        description: `Fetched and stored ${data.images?.length || 0} images for property ${selectedPropertyId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property-images-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error Fetching Images",
        description: error.message || "Failed to fetch images for property",
        variant: "destructive",
      });
    },
  });

  // Bulk image fetch mutation
  const bulkFetchMutation = useMutation({
    mutationFn: async (limit: number) => {
      const response = await fetch('/api/property-images/bulk-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Fetch Completed",
        description: `Processed ${data.processed || 0} properties and stored ${data.totalImages || 0} images`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-images-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Bulk Fetch Error",
        description: error.message || "Failed to perform bulk image fetch",
        variant: "destructive",
      });
    },
  });

  const handleFetchImages = () => {
    if (!selectedPropertyId.trim()) {
      toast({
        title: "Property ID Required",
        description: "Please enter a property ID to fetch images",
        variant: "destructive",
      });
      return;
    }
    fetchImagesMutation.mutate(selectedPropertyId);
  };

  const handleBulkFetch = () => {
    const limit = parseInt(bulkFetchCount);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      toast({
        title: "Invalid Limit",
        description: "Please enter a number between 1 and 100",
        variant: "destructive",
      });
      return;
    }
    bulkFetchMutation.mutate(limit);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Image Storage Test</h1>
          <p className="text-muted-foreground">
            Test the database-backed property image storage system using Google Maps API
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Single Property Image Fetch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Fetch Images for Property
            </CardTitle>
            <CardDescription>
              Fetch and store up to 3 images for a specific property using Google Maps API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID</Label>
              <Input
                id="propertyId"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                placeholder="Enter property ID (e.g., 1, 2, 3...)"
              />
            </div>
            <Button 
              onClick={handleFetchImages}
              disabled={fetchImagesMutation.isPending}
              className="w-full"
            >
              {fetchImagesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Images...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Fetch Images
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Image Fetch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Bulk Image Fetch
            </CardTitle>
            <CardDescription>
              Fetch and store images for multiple properties in batches of 5
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkCount">Number of Properties (1-100)</Label>
              <Input
                id="bulkCount"
                type="number"
                min="1"
                max="100"
                value={bulkFetchCount}
                onChange={(e) => setBulkFetchCount(e.target.value)}
                placeholder="10"
              />
            </div>
            <Button 
              onClick={handleBulkFetch}
              disabled={bulkFetchMutation.isPending}
              className="w-full"
              variant="secondary"
            >
              {bulkFetchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Bulk Fetch...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Start Bulk Fetch
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Image Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Image Storage Statistics</CardTitle>
            <CardDescription>
              Current status of the property image database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : imageStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Images:</span>
                  <span className="font-medium">{(imageStats as any).totalImages || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Properties with Images:</span>
                  <span className="font-medium">{(imageStats as any).totalProperties || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average per Property:</span>
                  <span className="font-medium">{(imageStats as any).averageImagesPerProperty?.toFixed(1) || '0'}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No statistics available</p>
            )}
          </CardContent>
        </Card>

        {/* Property Images Display */}
        <Card>
          <CardHeader>
            <CardTitle>Images for Property {selectedPropertyId}</CardTitle>
            <CardDescription>
              Stored images for the selected property
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : propertyImages && Array.isArray(propertyImages) && (propertyImages as PropertyImage[]).length > 0 ? (
              <div className="space-y-4">
                {(propertyImages as PropertyImage[]).map((image: PropertyImage) => (
                  <div key={image.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{image.imageType}</span>
                      <span className="text-xs text-muted-foreground">Order: {image.imageOrder}</span>
                    </div>
                    <img 
                      src={image.imageUrl} 
                      alt={`Property ${image.propertyId} - ${image.imageType}`}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Stored: {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No images found for this property
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter a property ID (1-2046) to fetch images for a specific property</li>
            <li>Use the bulk fetch to process multiple properties at once (batches of 5 to respect API limits)</li>
            <li>Images are fetched from Google Maps API using property location data</li>
            <li>Up to 3 images per property are stored: streetview, satellite, and nearby places</li>
            <li>All images are stored in the PostgreSQL database for fast retrieval</li>
            <li>View statistics to monitor the image storage system performance</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}