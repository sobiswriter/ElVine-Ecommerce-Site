import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, DollarSign, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  products: Product[];
  searchHistory?: { query: string; timestamp: number }[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onSearchSubmit?: (query: string) => void;
  onClearHistory?: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  products = [],
  searchHistory = [],
  onClose,
  onSelectProduct,
  onSearchSubmit,
  onClearHistory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const productList = products || [];
  const historyList = searchHistory || [];

  // Filter products
  const filtered = query.trim()
    ? productList.filter(
        (p) =>
          p.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.toLowerCase().includes(query.toLowerCase()) ||
          p.fabric?.toLowerCase().includes(query.toLowerCase()) ||
          p.materialDetails?.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          p.factory?.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.factory?.location?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (p: Product) => {
    if (query.trim() && onSearchSubmit) {
      onSearchSubmit(query.trim());
    }
    onSelectProduct(p);
    onClose();
  };

  const handleKeywordClick = (keyword: string) => {
    setQuery(keyword);
    if (onSearchSubmit) {
      onSearchSubmit(keyword);
    }
  };

  const trendingTags = [
    'Grade-A Cashmere',
    'Selvedge Denim',
    'Way-High Sailor Jean',
    'French Linen Trousers',
    'Organic Cotton Box Tee',
    'Italian ReWool Trench',
    'Clean Silk Boyfriend Shirt',
    'Alpaca Cardigan',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-3xl bg-white dark:bg-[#121214] border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Search Input Bar */}
          <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-zinc-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-stone-400 dark:text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by garment, organic fabric, certified factory, or cut..."
              className="w-full text-base sm:text-lg bg-transparent text-zinc-950 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-stone-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-100 dark:bg-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
            >
              Esc
            </button>
          </div>

          {/* Results / Suggestions Container */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {query.trim() === '' ? (
              /* Suggested & Trending Tags */
              <div className="space-y-6">
                {historyList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500">
                        Recent Searches
                      </h4>
                      {onClearHistory && (
                        <button
                          onClick={onClearHistory}
                          className="text-[11px] text-stone-400 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                        >
                          Clear History
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {historyList.slice(0, 6).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleKeywordClick(item.query)}
                          className="px-3 py-1.5 bg-stone-100 dark:bg-zinc-800/80 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{item.query}</span>
                          <ArrowRight className="w-3 h-3 text-stone-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-stone-600 dark:text-zinc-400" />
                    Trending Capsule Essentials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleKeywordClick(tag)}
                        className="px-3 py-1.5 bg-stone-50 dark:bg-zinc-800/40 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radical Transparency Highlight */}
                <div className="p-4 bg-[#f5f4f0] dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Factory className="w-4 h-4 text-stone-700 dark:text-zinc-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Radical Transparency Guarantee
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                    Search any garment to inspect its true raw material cost, artisan living wages, carbon-neutral shipping, and certified partner atelier audit scores.
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              /* No Results State */
              <div className="text-center py-12">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  No matching garments found for "{query}"
                </p>
                <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
                  Check the spelling or try searching for timeless fabrics like "Cashmere", "Selvedge Denim", or "French Linen".
                </p>
              </div>
            ) : (
              /* Product Search Results */
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 block mb-2">
                  Matching Garments ({filtered.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className="flex gap-3 p-3 bg-stone-50 dark:bg-zinc-900/60 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 transition-colors cursor-pointer group"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-20 object-cover bg-stone-200 dark:bg-zinc-800 shrink-0"
                      />
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-zinc-400 block truncate">
                            {product.fabric} • {product.department}
                          </span>
                          <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:underline">
                            {product.title}
                          </h5>
                          <span className="text-[11px] text-stone-500 dark:text-zinc-400 block truncate">
                            {product.colorName}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1 border-t border-stone-200 dark:border-zinc-800/80">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-stone-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-stone-500 dark:text-zinc-400">
                            Cost: ₹{product.transparentCost.totalTrueCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
