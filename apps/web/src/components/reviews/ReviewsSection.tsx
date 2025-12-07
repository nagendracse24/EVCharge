'use client'

import { useState } from 'react'
import { useStationReviews, useAddReview, useVoteReview } from '@/hooks/useReviews'
import { useAuth } from '@/context/AuthContext'
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Plus } from 'lucide-react'

interface ReviewsSectionProps {
  stationId: string
}

export function ReviewsSection({ stationId }: ReviewsSectionProps) {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  const [showAddReview, setShowAddReview] = useState(false)
  
  const { data, isLoading } = useStationReviews(stationId, sortBy)
  const addReview = useAddReview()
  const voteReview = useVoteReview()

  const reviews = data?.data || []

  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    cleanliness_rating: 5,
    reliability_rating: 5,
    value_rating: 5,
  })

  const handleSubmitReview = async () => {
    try {
      await addReview.mutateAsync({
        station_id: stationId,
        ...newReview,
      })
      setShowAddReview(false)
      setNewReview({
        rating: 5,
        title: '',
        comment: '',
        cleanliness_rating: 5,
        reliability_rating: 5,
        value_rating: 5,
      })
      alert('Review submitted!')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`text-2xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
            star <= value ? 'text-yellow-400' : 'text-gray-600'
          }`}
          disabled={readonly}
        >
          <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  )

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-800 rounded w-32"></div>
      {[1, 2].map(i => (
        <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
      ))}
    </div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white">Reviews ({reviews.length})</h3>
        </div>

        {user && !showAddReview && (
          <button
            onClick={() => setShowAddReview(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Review
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-white mb-3">Write a Review</h4>
          
          <div className="space-y-4">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Overall Rating</label>
              <StarRating value={newReview.rating} onChange={(v) => setNewReview({ ...newReview, rating: v })} />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title (optional)</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Great charging experience!"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Share your experience..."
              />
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cleanliness</label>
                <StarRating value={newReview.cleanliness_rating} onChange={(v) => setNewReview({ ...newReview, cleanliness_rating: v })} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Reliability</label>
                <StarRating value={newReview.reliability_rating} onChange={(v) => setNewReview({ ...newReview, reliability_rating: v })} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Value</label>
                <StarRating value={newReview.value_rating} onChange={(v) => setNewReview({ ...newReview, value_rating: v })} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddReview(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={addReview.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {addReview.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex gap-2 mb-4">
          {['recent', 'helpful', 'rating'].map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === sort
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {sort === 'recent' && 'Most Recent'}
              {sort === 'helpful' && 'Most Helpful'}
              {sort === 'rating' && 'Highest Rated'}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No reviews yet</p>
          {user && (
            <p className="text-gray-500 text-xs mt-1">Be the first to review this station!</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating value={review.rating} readonly />
                    {review.is_verified_booking && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-white">{review.title}</h4>
                  )}
                  <p className="text-xs text-gray-500">
                    {review.user?.email?.split('@')[0] || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-300 text-sm mb-3">{review.comment}</p>
              )}

              {/* Detailed Ratings */}
              {(review.cleanliness_rating || review.reliability_rating || review.value_rating) && (
                <div className="grid grid-cols-3 gap-3 mb-3 pt-3 border-t border-gray-700">
                  {review.cleanliness_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Cleanliness</div>
                      <StarRating value={review.cleanliness_rating} readonly />
                    </div>
                  )}
                  {review.reliability_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Reliability</div>
                      <StarRating value={review.reliability_rating} readonly />
                    </div>
                  )}
                  {review.value_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Value</div>
                      <StarRating value={review.value_rating} readonly />
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-700">
                <span className="text-xs text-gray-500">Was this helpful?</span>
                <button
                  onClick={() => user && voteReview.mutate({ reviewId: review.id, isHelpful: true })}
                  disabled={!user}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {review.helpful_count || 0}
                </button>
                <button
                  onClick={() => user && voteReview.mutate({ reviewId: review.id, isHelpful: false })}
                  disabled={!user}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <ThumbsDown className="w-3 h-3" />
                  {review.not_helpful_count || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

