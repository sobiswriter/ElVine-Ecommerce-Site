import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Product, AIRecommendation } from '../types';

interface SmartRecommendationsProps {
  recommendations: AIRecommendation[];
  products: Product[];
  stockMap: Record<string, number>;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onOpenConcierge: () => void;
  hasHistory: boolean;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  recommendations = [],
  products = [],
  isLoading,
  onRefresh,
  onSelectProduct,
  onOpenConcierge,
  hasHistory,
}) => {
  const recList = recommendations || [];
  if (recList.length === 0 && !isLoading) return null;

  return (
    <section
      id="smart-recommendations-section"
      className="my-12 py-8 border-t border-b border-stone-200 dark:border-zinc-800"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-500 dark:text-zinc-400">
              {hasHistory ? 'Curated Capsule Pairs' : 'Forever Wardrobe Essentials'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Complete Your Minimalist Wardrobe
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            {hasHistory
              ? 'Paired based on your recently browsed fabrics and capsule silhouettes.'
              : 'Enduring essentials crafted to pair effortlessly across every season.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-stone-200 dark:border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
          <button
            onClick={onOpenConcierge}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-300 dark:text-stone-700" />
            <span>Capsule Stylist AI</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-stone-100 dark:bg-zinc-800 animate-pulse"
              />
            ))
          : recList.map((rec) => {
              const product = (products || []).find((p) => p.id === rec.productId);
              if (!product) return null;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f3ef] dark:bg-[#18181b] mb-2.5">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                      alt={product.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-white/95 dark:bg-zinc-900/95 px-2 py-0.5 text-[10px] font-medium text-zinc-900 dark:text-zinc-100">
                      {rec.contextTag}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 italic mb-1 line-clamp-1">
                    "{rec.reason}"
                  </p>

                  <h3 className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug group-hover:underline">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">
                      Cost: ₹{(product.transparentCost?.totalTrueCost || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
};
