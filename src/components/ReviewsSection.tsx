import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, Plus, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from '../types';

interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
  overallRating: number;
  reviewCount: number;
  onAddReview: (review: Partial<Review>) => Promise<void>;
  onVoteHelpful: (reviewId: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
  reviews = [],
  overallRating = 5,
  reviewCount = 0,
  onAddReview,
  onVoteHelpful,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<number | 'all'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewList = reviews || [];

  // Calculate distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewList.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = reviewList.length ? Math.round((count / reviewList.length) * 100) : 0;
    return { stars, count, percentage };
  });

  const filteredReviews =
    selectedFilter === 'all'
      ? reviewList
      : reviewList.filter((r) => Math.round(r.rating) === selectedFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !author.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddReview({
        productId,
        author,
        rating,
        title: title.trim() || 'Verified Experience',
        comment,
      });
      setIsWriteModalOpen(false);
      setTitle('');
      setComment('');
      setRating(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="reviews-section" className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
      {/* Header & Write Review Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-serif text-2xl font-medium text-zinc-900 dark:text-zinc-100">
            Customer Reviews
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
            Real feedback from verified ElVine capsule wardrobe owners and stylists
          </p>
        </div>
        <button
          id="write-review-btn"
          onClick={() => setIsWriteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 mb-8">
        {/* Overall Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
          <span className="font-serif text-5xl font-semibold text-zinc-900 dark:text-zinc-100">
            {overallRating}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(overallRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-300 dark:text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Based on {reviewCount} verified reviews
          </span>
          <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> 98% recommendation rate
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              onClick={() => setSelectedFilter(selectedFilter === stars ? 'all' : stars)}
              className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
            >
              <span className="w-12 text-left font-medium">{stars} Stars</span>
              <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 font-mono">
                {count}
              </span>
            </button>
          ))}

          {selectedFilter !== 'all' && (
            <button
              onClick={() => setSelectedFilter('all')}
              className="text-left text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline mt-2 cursor-pointer"
            >
              Clear rating filter (showing {selectedFilter}-star reviews)
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No reviews matching this rating yet. Be the first to share your thoughts!
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {rev.author}
                      </span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified Owner
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">{rev.date}</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-200 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {rev.title}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Attached Photos if any */}
              {rev.photos && rev.photos.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  {rev.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt="Customer review photo"
                      className="w-16 h-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Votes Action */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                <span className="text-zinc-400">Was this review helpful to you?</span>
                <button
                  onClick={() => onVoteHelpful(rev.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    rev.userVotedHelpful
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulVotes})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="font-serif text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Write a Review
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Share your design impressions and tactile experience
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-2">
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Exceptional build quality and acoustics"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                {/* Detailed Comment */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Experience
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the materials, craftsmanship, daily usage, and overall aesthetic..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
