import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Product, Department } from '../types';
import { ProductCard } from './ProductCard';

interface EditorialHomeProps {
  products: Product[];
  inventoryState: Record<string, number>;
  wishlist: string[];
  department: Department;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onNavigateToCategory: (category: string) => void;
  onOpenTransparency: () => void;
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({
  products,
  inventoryState,
  wishlist,
  department,
  onToggleWishlist,
  onSelectProduct,
  onNavigateToCategory,
  onOpenTransparency,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const newArrivals = products.filter((p) => p.isNew || p.isFeatured).slice(0, 8);

  return (
    <div className="w-full flex flex-col space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section: The Pre-Fall Sale */}
      <section className="relative w-full overflow-hidden bg-stone-900 text-white min-h-[520px] sm:min-h-[600px] flex items-center justify-center">
        {/* Background Editorial Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=85"
            alt="The Pre-Fall Collection"
            className="w-full h-full object-cover object-center opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-medium text-stone-300 mb-3">
            Limited Time Event
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight uppercase text-white mb-4">
            The Pre-Fall Sale
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-stone-200 font-light max-w-xl mb-8 leading-relaxed">
            20% Off Purchases of ₹12,000+ &nbsp;|&nbsp; 30% Off Purchases of ₹20,000+
            <span className="block text-xs text-stone-400 mt-1">Discount automatically applied in bag.</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToCategory('Clothing')}
              className="w-full sm:w-44 py-3.5 px-6 bg-white text-zinc-950 text-xs uppercase font-bold tracking-widest hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Shop Women
            </button>
            <button
              onClick={() => onNavigateToCategory('Clothing')}
              className="w-full sm:w-44 py-3.5 px-6 bg-transparent text-white text-xs uppercase font-bold tracking-widest border border-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Shop Men
            </button>
          </div>
        </div>
      </section>

      {/* "Almost Fall Vibes" / New Arrivals Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-950 dark:text-white tracking-tight">
              Almost Fall Vibes
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
              Crisp mornings call for refined layers and breathable linen transitions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollCarousel('left')}
              aria-label="Previous products"
              className="p-2 border border-stone-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              aria-label="Next products"
              className="p-2 border border-stone-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={carouselRef}
          className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {newArrivals.map((product) => (
            <div key={product.id} className="w-[240px] sm:w-[280px] flex-shrink-0">
              <ProductCard
                product={product}
                stock={inventoryState[product.id] ?? product.stock}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3-Up Editorial Story Blocks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: New Arrivals */}
          <div className="flex flex-col group cursor-pointer" onClick={() => onNavigateToCategory('New Arrivals')}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-zinc-900 mb-4">
              <img
                src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
                alt="New Arrivals"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">
              New Arrivals
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-3">
              Modern silhouettes crafted from Grade-A cashmere and organic French linen.
            </p>
            <div>
              <button className="text-xs uppercase tracking-widest font-bold text-zinc-950 dark:text-white underline underline-offset-4 hover:text-stone-600 transition-colors">
                Shop The Latest
              </button>
            </div>
          </div>

          {/* Card 2: Crisp & Cool */}
          <div className="flex flex-col group cursor-pointer" onClick={() => onNavigateToCategory('Pants')}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-zinc-900 mb-4">
              <img
                src="https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1000&q=80"
                alt="Crisp & Cool"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">
              Crisp &amp; Cool
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-3">
              100% European Flax® linen trousers tailored for effortless heat comfort.
            </p>
            <div>
              <button className="text-xs uppercase tracking-widest font-bold text-zinc-950 dark:text-white underline underline-offset-4 hover:text-stone-600 transition-colors">
                Shop Linen
              </button>
            </div>
          </div>

          {/* Card 3: Best-Selling Tees */}
          <div className="flex flex-col group cursor-pointer" onClick={() => onNavigateToCategory('Tees')}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 dark:bg-zinc-900 mb-4">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
                alt="Best-Selling Tees"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">
              Best-Selling Tees
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-3">
              Organic Peruvian Pima cotton with zero bacon collars.
            </p>
            <div className="flex items-center gap-4">
              <button className="text-xs uppercase tracking-widest font-bold text-zinc-950 dark:text-white underline underline-offset-4 hover:text-stone-600 transition-colors">
                Shop Now
              </button>
              <span className="text-stone-300">|</span>
              <button className="text-xs uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                The Tee Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Radical Transparency Editorial Banner */}
      <section className="bg-[#f5f4f0] dark:bg-[#141416] py-14 px-6 border-y border-stone-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-stone-500 dark:text-zinc-400 mb-3">
            Our Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white mb-4">
            Radical Transparency
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 max-w-2xl leading-relaxed mb-6 font-normal">
            We believe our customers have a right to know what their clothes cost to make. For every garment we produce, we disclose the exact cost of materials, hardware, labor, transport, and import duties.
          </p>
          <button
            onClick={onOpenTransparency}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs uppercase font-bold tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            Explore Our Factories &amp; True Costs
          </button>
        </div>
      </section>
    </div>
  );
};
