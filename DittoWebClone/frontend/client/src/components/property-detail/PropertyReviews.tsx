import { PropertyReview } from '@/lib/models/property';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';

interface PropertyReviewsProps {
  reviews: PropertyReview[];
}

export default function PropertyReviews({ reviews }: PropertyReviewsProps) {
  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  // Count reviews by rating (5, 4, 3, 2, 1)
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => {
    return {
      rating,
      count: reviews.filter(review => Math.floor(review.rating) === rating).length,
      percentage: (reviews.filter(review => Math.floor(review.rating) === rating).length / reviews.length) * 100
    };
  });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-6">Reviews & Ratings</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Based on {reviews.length} reviews
          </p>
        </div>

        <div className="col-span-2">
          <div className="space-y-2">
            {ratingCounts.map((item) => (
              <div key={item.rating} className="flex items-center">
                <div className="w-16 text-sm text-gray-600">
                  {item.rating} stars
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-sm text-gray-600 text-right">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-[#1752FF] text-white">
                    {getInitials(review.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900">{review.userName}</h4>
                  <p className="text-xs text-gray-500">
                    {review.date} • Source: {review.source}
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-md">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm font-medium">{review.rating}</span>
              </div>
            </div>

            <p className="text-gray-700 mt-2">{review.comment}</p>

            <div className="mt-3 flex items-center">
              <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
        <button className="text-[#1752FF] font-medium hover:underline">
          See all {reviews.length} reviews
        </button>
      </div>
    </div>
  );
}