import { PropertyRating } from '@/lib/models/property';

interface PropertyRatingsProps {
  ratings: PropertyRating;
}

export default function PropertyRatings({ ratings }: PropertyRatingsProps) {
  const ratingCategories = [
    { name: "Location", value: ratings.categories.location, icon: "📍" },
    { name: "Construction", value: ratings.categories.construction, icon: "🏗️" },
    { name: "Amenities", value: ratings.categories.amenities, icon: "🏊" },
    { name: "Value for Money", value: ratings.categories.valueForMoney, icon: "💰" },
    { name: "Connectivity", value: ratings.categories.connectivity, icon: "🚗" },
    { name: "Legal Compliance", value: ratings.categories.legalCompliance, icon: "📜" },
    { name: "Environment", value: ratings.categories.environment, icon: "🌳" },
  ];

  // Helper to get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-green-500';
    if (rating >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper to get rating text
  const getRatingText = (rating: number) => {
    if (rating >= 8) return 'Excellent';
    if (rating >= 6) return 'Good';
    if (rating >= 4) return 'Average';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h3 className="text-xl font-bold">Relai Project Rating</h3>
          <p className="text-gray-500 text-sm mt-1">
            The Relai rating is based on our experts' thorough assessment of the property
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getRatingColor(ratings.overall)}`}>
            {ratings.overall}
          </div>
          <div className="ml-3">
            <p className="font-bold text-lg">{getRatingText(ratings.overall)}</p>
            <p className="text-sm text-gray-500">Overall Rating</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {ratingCategories.map((category) => (
          <div key={category.name} className="relative">
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-2">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center">
                <span className={`inline-block h-6 w-6 rounded-full mr-2 text-xs text-white font-medium flex items-center justify-center ${getRatingColor(category.value)}`}>
                  {category.value}
                </span>
                <span className="text-sm text-gray-600">
                  {getRatingText(category.value)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getRatingColor(category.value)}`}
                style={{ width: `${category.value * 10}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold mb-3">Rating Methodology</h4>
        <p className="text-gray-600 text-sm">
          Our ratings are based on an extensive evaluation process conducted by Relai's property experts. 
          Each category is assessed on various parameters, and the final score is weighted based on the 
          importance of each factor. Ratings are on a scale of 1-10, with 10 being the highest.
        </p>
      </div>
    </div>
  );
}