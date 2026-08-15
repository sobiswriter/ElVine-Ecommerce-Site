import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  stock: number;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart?: (p: Product, e?: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  stock,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
}) => {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const colorsList = product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Natural', hex: '#e7e5e4' }];
  const activeColor = colorsList[activeColorIndex] || colorsList[0];
  const displayImage = isHovered && product.images?.[1] ? product.images[1] : (product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80');
  const isOutOfStock = stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col cursor-pointer transition-all duration-200"
      onClick={() => onSelectProduct(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f3ef] dark:bg-[#18181b] mb-3">
        <img
          src={displayImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNew && (
            <span className="text-[11px] font-medium tracking-wide text-zinc-900 dark:text-zinc-100 bg-white/90 dark:bg-zinc-900/90 px-1.5 py-0.5 rounded-xs">
              New!
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-10 p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-transform active:scale-90 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white' : 'stroke-[1.5]'
            }`}
          />
        </button>

        {/* Quick Add Overlay on desktop hover */}
        <div className="absolute inset-x-2 bottom-2 hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full py-2 bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 text-[11px] font-semibold tracking-wider uppercase border border-stone-300 dark:border-zinc-700 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-colors shadow-xs"
          >
            Quick View & True Cost
          </button>
        </div>
      </div>

      {/* Color Swatch Dots */}
      <div className="flex items-center space-x-1.5 mb-1.5" onClick={(e) => e.stopPropagation()}>
        {colorsList.map((c, idx) => (
          <button
            key={c.name}
            onClick={() => setActiveColorIndex(idx)}
            aria-label={`Select color ${c.name}`}
            className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
              activeColorIndex === idx
                ? 'border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white scale-110'
                : 'border-stone-300 dark:border-zinc-700 hover:scale-105'
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
        {colorsList.length > 4 && (
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 pl-1">
            +{colorsList.length - 4}
          </span>
        )}
      </div>

      {/* Product Title */}
      <h3 className="text-[13px] sm:text-[14px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1 group-hover:underline underline-offset-2">
        {product.title}
      </h3>

      {/* Color Name */}
      <p className="text-[12px] text-stone-500 dark:text-zinc-400 mb-1">
        {activeColor.name}
      </p>

      {/* Price & True Cost */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[13px] sm:text-[14px] font-semibold text-zinc-950 dark:text-white">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-[12px] text-stone-400 dark:text-zinc-500 line-through">
            ₹{product.originalPrice.toLocaleString('en-IN')}
          </span>
        )}
        <span className="text-[10px] font-mono text-stone-500 dark:text-zinc-400 ml-auto">
          True Cost: ₹{product.transparentCost.totalTrueCost.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Rectangular Sustainability Badges */}
      <div className="flex flex-wrap gap-1 mt-auto">
        {(product.sustainabilityBadges || ['ORGANIC COTTON', 'EVER-BETTER FACTORY']).slice(0, 2).map((badge) => (
          <span
            key={badge}
            className="text-[9px] uppercase font-medium tracking-wider text-stone-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800/70 px-1.5 py-0.5 rounded-xs"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
};
