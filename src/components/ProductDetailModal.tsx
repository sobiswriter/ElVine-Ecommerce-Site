import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Check,
  Share2,
  Heart,
  Factory,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  Scale,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Review } from '../types';
import { ReviewsSection } from './ReviewsSection';

interface ProductDetailModalProps {
  product: Product | null;
  stock: number;
  isWishlisted: boolean;
  reviews: Review[];
  allProducts: Product[];
  onClose: () => void;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, qty: number, color?: string, size?: string) => void;
  onInstantBuy: (p: Product, qty: number, color?: string, size?: string) => void;
  onAddReview: (rev: Partial<Review>) => Promise<void>;
  onVoteHelpful: (reviewId: string) => void;
  onSelectRelated: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  stock,
  isWishlisted,
  reviews,
  allProducts,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onInstantBuy,
  onAddReview,
  onVoteHelpful,
  onSelectRelated,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'transparency' | 'factory' | 'materials' | 'specs'>('transparency');
  const [copied, setCopied] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [addedForeverItemId, setAddedForeverItemId] = useState<string | null>(null);

  // Reset states when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedColor(product.colors?.[0]?.name || '');
    setSelectedSize(product.sizes?.[0] || '');
    setQuantity(1);
  }, [product.id]);

  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock <= 0;

  // Filter reviews for this product
  const productReviews = (reviews || []).filter((r) => r.productId === product.id);

  // Forever Wardrobe complementary products
  const complementaryProducts = (allProducts || []).filter((p) =>
    product.complementaryProductIds?.includes(p.id) || (p.id !== product.id && p.category !== product.category)
  ).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleAddComplementary = (compProduct: Product) => {
    onAddToCart(compProduct, 1, compProduct.colors?.[0]?.name || 'Standard', compProduct.sizes?.[0] || 'M');
    setAddedForeverItemId(compProduct.id);
    setTimeout(() => setAddedForeverItemId(null), 1500);
  };

  const savings = (product.transparentCost?.traditionalRetailPrice || (product.price * 2.2)) - product.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 24 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-5xl bg-[#fcfbf9] dark:bg-[#111113] rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden my-auto"
        >
          {/* Top Sticky Header */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-3.5 bg-[#fcfbf9]/95 dark:bg-[#111113]/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-widest text-stone-600 dark:text-zinc-400">
                {product.category}
              </span>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Radical Transparency Verified
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleShare}
                aria-label="Share product"
                className="p-2 rounded-full text-stone-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onToggleWishlist(product)}
                aria-label="Wishlist"
                className="p-2 rounded-full text-stone-500 hover:text-rose-500 hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-full text-stone-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-8 lg:p-10 space-y-10">
            {/* Top Grid: Images and Action Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left: Gallery */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="relative aspect-3/4 sm:aspect-4/4.5 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800">
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0.85 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    src={product.images[activeImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Stock and Origin Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-zinc-950/90 text-white rounded-xs backdrop-blur-xs">
                      {product.fabric}
                    </span>
                    {isLowStock && (
                      <span className="px-2.5 py-1 text-[10px] font-medium bg-amber-500 text-zinc-950 rounded-xs flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-ping" />
                        Live Stock: {stock} units left
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-1.5 rounded bg-zinc-950/85 text-white text-xs backdrop-blur-sm">
                    <span className="font-light">
                      {product.factory?.countryFlag || '🌍'} {product.factory?.name || 'Partner Factory'} ({product.factory?.location || 'Certified'})
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold text-xs">
                      Cost: ₹{(product.transparentCost?.totalTrueCost || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-18 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-zinc-900 dark:border-zinc-100 scale-102 shadow-xs'
                            : 'border-transparent opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Buy Controls & Specs */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Category & Fit Badges */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-stone-200/70 dark:bg-zinc-800 text-[10px] font-semibold text-stone-700 dark:text-zinc-300">
                        {product.fit}
                      </span>
                      {product.waistband && (
                        <span className="px-2 py-0.5 rounded bg-stone-200/70 dark:bg-zinc-800 text-[10px] font-semibold text-stone-700 dark:text-zinc-300">
                          {product.waistband}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                        {product.rating}
                      </span>
                      <span className="text-stone-400 text-xs">
                        ({productReviews.length} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                      {product.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Price & Radical Transparency Savings Banner */}
                  <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-zinc-900/90 border border-stone-200/80 dark:border-zinc-800">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-zinc-500 line-through">
                          Trad. Retail ₹{product.transparentCost.traditionalRetailPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-zinc-400">
                      <strong>Radical Transparency Price:</strong> We reveal our ₹
                      {product.transparentCost.totalTrueCost.toLocaleString('en-IN')} true production cost and bypass traditional retail 5x markups.
                    </p>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-stone-700 dark:text-zinc-300 mb-1.5">
                      <span>Color: <strong>{selectedColor}</strong></span>
                      <span className="text-[10px] text-stone-500">{product.colors.length} Available Shades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`p-0.5 rounded-full border-2 transition-all cursor-pointer ${
                            selectedColor === color.name
                              ? 'border-zinc-900 dark:border-zinc-100 scale-110'
                              : 'border-transparent hover:border-stone-300'
                          }`}
                          title={color.name}
                        >
                          <span
                            className="block w-5.5 h-5.5 rounded-full border border-stone-300/80 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selector */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium text-stone-700 dark:text-zinc-300 mb-1.5">
                        <span>Select Size: <strong>{selectedSize}</strong></span>
                        <span className="text-[11px] text-stone-500 underline cursor-pointer">
                          Size & Measurement Chart
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-9 px-2.5 py-1 text-xs font-semibold rounded border transition-all cursor-pointer ${
                              selectedSize === size
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                : 'bg-transparent text-stone-800 dark:text-zinc-200 border-stone-300 dark:border-zinc-700 hover:border-stone-500'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      {/* Fit Feedback Indicator */}
                      {product.fitFeedback && (
                        <div className="mt-2 text-[10px] text-stone-500 flex items-center gap-3">
                          <span>Fit Consensus:</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {product.fitFeedback.trueToSize}% say True to Size
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2.5">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-300 dark:border-zinc-700 rounded-lg bg-stone-50 dark:bg-zinc-900 p-0.5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1 || isOutOfStock}
                          className="p-1.5 rounded text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                          disabled={quantity >= stock || isOutOfStock}
                          className="p-1.5 rounded text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add to Bag Button */}
                      <button
                        id="modal-add-to-cart"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-xs transition-all shadow-sm cursor-pointer ${
                          addedAnimation
                            ? 'bg-emerald-700 text-white'
                            : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {addedAnimation ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added to Your Wardrobe
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Add to Bag • ${(product.price * quantity).toFixed(0)}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Instant 1-Click Buy */}
                    {!isOutOfStock && (
                      <button
                        id="modal-instant-buy"
                        onClick={() => onInstantBuy(product, quantity, selectedColor, selectedSize)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs bg-stone-200 hover:bg-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer border border-stone-300 dark:border-zinc-700"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Instant Checkout with Saved Info</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Assurance Badges */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200 dark:border-zinc-800 text-[10px] text-stone-600 dark:text-zinc-400 mt-4">
                  <div className="flex items-center gap-1.5 p-2 rounded bg-stone-100/60 dark:bg-zinc-900/60">
                    <Truck className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200 shrink-0" />
                    <span>Carbon-Neutral Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded bg-stone-100/60 dark:bg-zinc-900/60">
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200 shrink-0" />
                    <span>30-Day Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded bg-stone-100/60 dark:bg-zinc-900/60">
                    <Award className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200 shrink-0" />
                    <span>Ethical Fair Wage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RADICAL TRANSPARENCY DEEP DIVE SECTION */}
            <div className="border-t border-stone-200 dark:border-zinc-800 pt-8">
              <div className="flex items-center gap-2 sm:gap-6 border-b border-stone-200 dark:border-zinc-800 pb-3 overflow-x-auto">
                {(['transparency', 'factory', 'materials', 'specs'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer relative pb-3 -mb-3.5 shrink-0 ${
                      activeTab === tab
                        ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                        : 'text-stone-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {tab === 'transparency'
                      ? 'True Cost Breakdown'
                      : tab === 'factory'
                      ? 'Ethical Factory & Conditions'
                      : tab === 'materials'
                      ? 'Sustainable Materials & Origin'
                      : 'Garment Specs & Care'}
                  </button>
                ))}
              </div>

              <div className="py-6">
                {/* 1. Radical Transparency Pricing Tab */}
                {activeTab === 'transparency' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-100 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          The Radical Transparency Cost Breakdown
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">
                          We believe you have the right to know what your clothes cost to make.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-500 block">Total True Production Cost</span>
                        <span className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
                          ₹{product.transparentCost.totalTrueCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Cost Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-stone-500">1. Materials</span>
                        <p className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          ₹{product.transparentCost.materials.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-stone-500">Fabric, yarns, certified dyes</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-stone-500">2. Hardware</span>
                        <p className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          ₹{product.transparentCost.hardware.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-stone-500">Zippers, corozo buttons, labels</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-stone-500">3. Labor</span>
                        <p className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          ₹{product.transparentCost.labor.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-stone-500">Fair-wage cutting, sewing, finishing</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-stone-500">4. Transport</span>
                        <p className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          ₹{product.transparentCost.transport.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-stone-500">Carbon-neutral ocean/air freight</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-stone-500">5. Duties & Tariffs</span>
                        <p className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          ₹{product.transparentCost.duties.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-stone-500">Port customs & import compliance</span>
                      </div>
                    </div>

                    {/* Price Comparison Comparison Bar */}
                    <div className="p-4 rounded-xl bg-stone-100 dark:bg-zinc-900/70 border border-stone-200 dark:border-zinc-800 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                        Pricing Comparison: ElVine vs. Traditional Fashion Retail
                      </h5>

                      <div className="space-y-2 text-xs">
                        {/* ElVine Price */}
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                              ElVine Transparent Price (Direct-to-Customer)
                            </span>
                            <span className="font-mono font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="w-full h-3 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-zinc-900 dark:bg-white rounded-full"
                              style={{ width: `${(product.price / product.transparentCost.traditionalRetailPrice) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Traditional Retail Markup */}
                        <div>
                          <div className="flex justify-between text-stone-500 dark:text-zinc-400 mb-1">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-stone-400" />
                              Traditional Retail Price (5x-6x Department Store Markup)
                            </span>
                            <span className="font-mono">₹{product.transparentCost.traditionalRetailPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="w-full h-3 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-stone-400 dark:bg-zinc-600 rounded-full w-full" />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium pt-1">
                        By cutting out wholesale middlemen, costly storefront overhead, and designer licensing markups, ElVine passes ₹{savings.toLocaleString('en-IN')} in direct savings to you.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Factory Details Tab */}
                {activeTab === 'factory' && product.factory && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-5 rounded-xl overflow-hidden aspect-4/3 bg-stone-200 border border-stone-200 dark:border-zinc-800">
                        <img
                          src={product.factory.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'}
                          alt={product.factory.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:col-span-7 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{product.factory.countryFlag}</span>
                          <div>
                            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                              {product.factory.name}
                            </h4>
                            <span className="text-xs text-stone-500 dark:text-zinc-400">
                              {product.factory.location}, {product.factory.country} • Est. {product.factory.established}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                          {product.factory.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {product.factory.certifications?.map((cert) => (
                            <span
                              key={cert}
                              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold"
                            >
                              ✓ {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Working Conditions Grid */}
                    {product.factory.workingConditions && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Living Wage Index</span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
                            {product.factory.workingConditions.livingWage}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Renewable Power</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mt-1">
                            {product.factory.workingConditions.renewableEnergy}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Female Leadership</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mt-1">
                            {product.factory.workingConditions.femaleLeadership}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                          <span className="text-[10px] text-stone-500 font-bold uppercase block">Waste Circularity</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mt-1">
                            {product.factory.workingConditions.wasteRecycled}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Sustainable Materials Tab */}
                {activeTab === 'materials' && (
                  <div className="space-y-4 text-xs text-stone-700 dark:text-zinc-300">
                    <div className="p-4 rounded-xl bg-stone-100 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">
                        Material Composition & Sourcing
                      </h4>
                      <p className="leading-relaxed">{product.materialDetails}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features?.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white mt-1.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Garment Specs Tab */}
                {activeTab === 'specs' && (
                  <div className="space-y-4">
                    {product.specs && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(product.specs).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex justify-between items-center py-2.5 px-4 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs"
                          >
                            <span className="text-stone-500 dark:text-zinc-400 font-medium">{k}</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-stone-100 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 text-xs text-stone-700 dark:text-zinc-300">
                      <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                        Care & Longevity Instructions
                      </h5>
                      <p>{product.careInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* "ADD TO YOUR FOREVER WARDROBE" CTA & RELATED CAPSULE SECTION */}
            {complementaryProducts.length > 0 && (
              <div className="border-t border-stone-200 dark:border-zinc-800 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 dark:text-emerald-400">
                      Capsule Wardrobe Synergy
                    </span>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Complete Your Capsule Look
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                      Timeless pieces designed to be paired effortlessly with {product.title}.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {complementaryProducts.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex flex-col justify-between"
                    >
                      <div
                        className="flex gap-3 cursor-pointer group"
                        onClick={() => onSelectRelated(comp)}
                      >
                        <img
                          src={comp.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                          alt={comp.title}
                          className="w-18 h-22 rounded-lg object-cover shrink-0 group-hover:opacity-90"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-stone-500 block">
                            {comp.fabric}
                          </span>
                          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-stone-600">
                            {comp.title}
                          </h5>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                            ₹{comp.price?.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                            True Cost ₹{(comp.transparentCost?.totalTrueCost || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Engaging CTA Button: "Add To Your Forever Wardrobe" */}
                      <button
                        onClick={() => handleAddComplementary(comp)}
                        className="mt-3 w-full py-1.5 px-2.5 rounded text-[11px] font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {addedForeverItemId === comp.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Added to Forever Wardrobe</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Add To Your Forever Wardrobe</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehensive Reviews Section */}
            <ReviewsSection
              productId={product.id}
              reviews={productReviews}
              overallRating={product.rating}
              reviewCount={productReviews.length}
              onAddReview={onAddReview}
              onVoteHelpful={onVoteHelpful}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
