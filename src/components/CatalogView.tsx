import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { Product, Department, FabricType, FitType, WaistbandType } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  inventoryState: Record<string, number>;
  wishlist: string[];
  department: Department;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
}

const COLOR_FILTERS = [
  { name: 'Black', hex: '#18181b' },
  { name: 'Canvas', hex: '#f4f0e6' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Oatmeal', hex: '#d8cfc4' },
  { name: 'Bone', hex: '#e7e5e4' },
  { name: 'Navy', hex: '#1e293b' },
  { name: 'Blue', hex: '#60a5fa' },
  { name: 'Olive', hex: '#5b6b52' },
  { name: 'Sand', hex: '#d6c7b2' },
  { name: 'Cocoa', hex: '#634b3f' },
  { name: 'Charcoal', hex: '#3f3f46' },
  { name: 'Camel', hex: '#b3987e' },
];

const CLOTHING_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const WAIST_SIZES = ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '38', '0', '2', '4', '6', '8', '10', '12', '14', '16'];

const FIT_OPTIONS: FitType[] = ['Slim Fit', 'Relaxed Fit', 'Oversized', 'Tailored', 'Classic Fit'];
const WAIST_OPTIONS: WaistbandType[] = ['High Rise', 'Mid Rise', 'Elastic Comfort', 'Flat Front', 'Drawstring'];
const FABRIC_OPTIONS: FabricType[] = [
  'Grade-A Cashmere',
  'Organic Pima Cotton',
  'Italian ReWool',
  'Selvedge Denim',
  'Clean Silk',
  'French Linen',
  'Alpaca Blend',
  'Lenzing Tencel',
];

const SUSTAINABILITY_OPTIONS = [
  'ORGANIC COTTON',
  'EUROPEAN FLAX',
  'CLEAN SILK',
  'RECYCLED WOOL (GRS)',
  'ZERO WASTE KNIT',
  'LWG GOLD TANNED',
  'SUSTAINABLE FIBRE ALLIANCE',
  'RADICAL TRANSPARENCY',
];

const PRICE_RANGES = [
  { id: 'under-4000', label: 'Under ₹4,000', min: 0, max: 4000 },
  { id: '4000-8000', label: '₹4,000 to ₹8,000', min: 4000, max: 8000 },
  { id: '8000-15000', label: '₹8,000 to ₹15,000', min: 8000, max: 15000 },
  { id: '15000-25000', label: '₹15,000 to ₹25,000', min: 15000, max: 25000 },
  { id: '25000-plus', label: '₹25,000 & Above', min: 25000, max: 999999 },
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  products = [],
  inventoryState = {},
  wishlist = [],
  department,
  selectedCategory,
  setSelectedCategory,
  onToggleWishlist,
  onSelectProduct,
}) => {
  // State for filters
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedWaistbands, setSelectedWaistbands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedSustainability, setSelectedSustainability] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'savings' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    department: true,
    category: true,
    price: true,
    fabric: true,
    fit: false,
    waistband: false,
    color: true,
    size: true,
    sustainability: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync with navbar selectedCategory
  const effectiveCategory = selectedCategory;

  // Department baseline
  const baseDepartmentProducts = useMemo(() => {
    const list = products || [];
    return list.filter((p) => {
      if (department === 'Women') {
        return p.department === 'Women' || p.department === 'Unisex';
      } else if (department === 'Men') {
        return p.department === 'Men' || p.department === 'Unisex';
      }
      return true;
    });
  }, [products, department]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return baseDepartmentProducts.filter((p) => {
      // Sub-category filter from navbar
      if (effectiveCategory !== 'All' && effectiveCategory !== 'Clothing') {
        if (effectiveCategory === 'New Arrivals' && !p.isNew) return false;
        if (effectiveCategory === 'Best Sellers' && (p.salesCount || 0) < 1000) return false;
        if (effectiveCategory === 'Pants' && !p.category?.includes('Denim') && !p.tags?.includes('Pants') && !p.tags?.includes('Chino')) return false;
        if (effectiveCategory === 'Jeans' && !p.tags?.includes('Jeans') && !p.tags?.includes('Denim')) return false;
        if (effectiveCategory === 'Tees' && !p.tags?.includes('Tee') && !p.tags?.includes('T-Shirt')) return false;
        if (effectiveCategory === 'Dresses' && !p.category?.includes('Dresses')) return false;
        if (effectiveCategory === 'Sweaters' && !p.category?.includes('Sweaters')) return false;
        if (effectiveCategory === 'Outerwear' && !p.category?.includes('Outerwear')) return false;
        if (effectiveCategory === 'Shoes & Bags' && !p.category?.includes('Footwear')) return false;
        if (effectiveCategory === 'Sale' && (!p.originalPrice || p.originalPrice <= p.price)) return false;
      }

      // Department filter
      if (selectedDepartments.length > 0) {
        if (!selectedDepartments.includes(p.department)) return false;
      }

      // Sidebar category checkboxes
      if (selectedCategories.length > 0) {
        const matchesCat = selectedCategories.some((cat) => {
          if (cat === 'Tees & Tops') return p.category === 'Tees & Tops';
          if (cat === 'Denim & Trousers') return p.category === 'Denim & Trousers';
          if (cat === 'Sweaters & Cashmere') return p.category === 'Sweaters & Cashmere';
          if (cat === 'Outerwear & Coats') return p.category === 'Outerwear & Coats';
          if (cat === 'Dresses & Jumpsuits') return p.category === 'Dresses & Jumpsuits';
          if (cat === 'Footwear & Accessories') return p.category === 'Footwear & Accessories';
          return false;
        });
        if (!matchesCat) return false;
      }

      // Price Range filter
      if (selectedPriceRanges.length > 0) {
        const matchesPrice = selectedPriceRanges.some((rangeId) => {
          const r = PRICE_RANGES.find((item) => item.id === rangeId);
          if (!r) return false;
          return p.price >= r.min && p.price < r.max;
        });
        if (!matchesPrice) return false;
      }

      // Fabric filter
      if (selectedFabrics.length > 0) {
        if (!selectedFabrics.includes(p.fabric)) return false;
      }

      // Fit filter
      if (selectedFits.length > 0) {
        if (!p.fit || !selectedFits.includes(p.fit)) return false;
      }

      // Waistband filter
      if (selectedWaistbands.length > 0) {
        if (!p.waistband || !selectedWaistbands.includes(p.waistband)) return false;
      }

      // Sustainability Badges filter
      if (selectedSustainability.length > 0) {
        const hasBadge = p.sustainabilityBadges?.some((b) =>
          selectedSustainability.some((sb) => b.toLowerCase().includes(sb.toLowerCase()))
        );
        if (!hasBadge) return false;
      }

      // Color filter
      if (selectedColors.length > 0) {
        const hasColor = p.colors?.some((c) =>
          selectedColors.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase()))
        );
        if (!hasColor) return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => p.sizes?.includes(s));
        if (!hasSize) return false;
      }

      // In Stock filter
      if (inStockOnly) {
        const currentStock = inventoryState[p.id] ?? p.stock;
        if (currentStock <= 0) return false;
      }

      return true;
    });
  }, [
    baseDepartmentProducts,
    effectiveCategory,
    selectedDepartments,
    selectedCategories,
    selectedPriceRanges,
    selectedFabrics,
    selectedFits,
    selectedWaistbands,
    selectedSustainability,
    selectedColors,
    selectedSizes,
    inStockOnly,
    inventoryState,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sortBy === 'savings') {
      sorted.sort((a, b) => {
        const savingsA = a.transparentCost.traditionalRetailPrice - a.price;
        const savingsB = b.transparentCost.traditionalRetailPrice - b.price;
        return savingsB - savingsA;
      });
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // Dynamic counts helper for categories
  const getCategoryCount = (categoryName: string) => {
    return baseDepartmentProducts.filter((p) => p.category === categoryName).length;
  };

  const getFabricCount = (fabricName: string) => {
    return baseDepartmentProducts.filter((p) => p.fabric === fabricName).length;
  };

  const getFitCount = (fitName: string) => {
    return baseDepartmentProducts.filter((p) => p.fit === fitName).length;
  };

  const getWaistCount = (waistName: string) => {
    return baseDepartmentProducts.filter((p) => p.waistband === waistName).length;
  };

  const getPriceRangeCount = (min: number, max: number) => {
    return baseDepartmentProducts.filter((p) => p.price >= min && p.price < max).length;
  };

  const getSustainabilityCount = (badge: string) => {
    return baseDepartmentProducts.filter((p) =>
      p.sustainabilityBadges?.some((b) => b.toLowerCase().includes(badge.toLowerCase()))
    ).length;
  };

  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedFabrics([]);
    setSelectedFits([]);
    setSelectedWaistbands([]);
    setSelectedPriceRanges([]);
    setSelectedSustainability([]);
    setInStockOnly(false);
    setSelectedCategory('All');
  };

  const hasActiveFilters =
    selectedDepartments.length > 0 ||
    selectedCategories.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    selectedFabrics.length > 0 ||
    selectedFits.length > 0 ||
    selectedWaistbands.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedSustainability.length > 0 ||
    inStockOnly ||
    (selectedCategory !== 'All' && selectedCategory !== 'Clothing');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      {/* Breadcrumbs */}
      <nav className="text-xs text-stone-500 dark:text-zinc-400 mb-4 flex items-center space-x-1.5 font-normal">
        <button onClick={() => setSelectedCategory('All')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
          ElVine
        </button>
        <span>/</span>
        <button onClick={() => setSelectedCategory('All')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
          {department}
        </button>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          {selectedCategory === 'All' ? `${department}'s Capsule Collection` : selectedCategory}
        </span>
      </nav>

      {/* Main Layout: Left Sidebar + Right Grid */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-2">
            {/* Header / Count & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-zinc-800">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-900 dark:text-zinc-100">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Garment' : 'Garments'}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-stone-500 hover:text-zinc-950 dark:hover:text-white underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* In Stock Only Switch */}
            <div className="pb-3 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">In Stock Only</span>
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  inStockOnly ? 'bg-zinc-950 dark:bg-white' : 'bg-stone-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 transition duration-200 ease-in-out translate-y-0.5 ${
                    inStockOnly ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Category Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Garment Category</span>
                {openSections.category ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.category && (
                <div className="mt-3 space-y-2 text-xs">
                  {[
                    'Tees & Tops',
                    'Denim & Trousers',
                    'Sweaters & Cashmere',
                    'Outerwear & Coats',
                    'Dresses & Jumpsuits',
                    'Footwear & Accessories',
                  ].map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    const count = getCategoryCount(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center justify-between text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedCategories((prev) =>
                                prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                              );
                            }}
                            className="rounded-xs border-stone-300 dark:border-zinc-700 text-zinc-950 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{cat}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-mono">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Transparent Price</span>
                {openSections.price ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.price && (
                <div className="mt-3 space-y-2 text-xs">
                  {PRICE_RANGES.map((pr) => {
                    const isChecked = selectedPriceRanges.includes(pr.id);
                    const count = getPriceRangeCount(pr.min, pr.max);
                    return (
                      <label
                        key={pr.id}
                        className="flex items-center justify-between text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedPriceRanges((prev) =>
                                prev.includes(pr.id) ? prev.filter((id) => id !== pr.id) : [...prev, pr.id]
                              );
                            }}
                            className="rounded-xs border-stone-300 dark:border-zinc-700 text-zinc-950 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{pr.label}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-mono">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fabric / Material Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('fabric')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Material & Fabric</span>
                {openSections.fabric ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.fabric && (
                <div className="mt-3 space-y-2 text-xs">
                  {FABRIC_OPTIONS.map((fabric) => {
                    const isChecked = selectedFabrics.includes(fabric);
                    const count = getFabricCount(fabric);
                    return (
                      <label
                        key={fabric}
                        className="flex items-center justify-between text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedFabrics((prev) =>
                                prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
                              );
                            }}
                            className="rounded-xs border-stone-300 dark:border-zinc-700 text-zinc-950 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{fabric}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-mono">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fit Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('fit')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Silhouette & Fit</span>
                {openSections.fit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.fit && (
                <div className="mt-3 space-y-2 text-xs">
                  {FIT_OPTIONS.map((fit) => {
                    const isChecked = selectedFits.includes(fit);
                    const count = getFitCount(fit);
                    return (
                      <label
                        key={fit}
                        className="flex items-center justify-between text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedFits((prev) =>
                                prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]
                              );
                            }}
                            className="rounded-xs border-stone-300 dark:border-zinc-700 text-zinc-950 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{fit}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-mono">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Waistband / Rise Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('waistband')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Rise & Waistband</span>
                {openSections.waistband ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.waistband && (
                <div className="mt-3 space-y-2 text-xs">
                  {WAIST_OPTIONS.map((waist) => {
                    const isChecked = selectedWaistbands.includes(waist);
                    const count = getWaistCount(waist);
                    return (
                      <label
                        key={waist}
                        className="flex items-center justify-between text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedWaistbands((prev) =>
                                prev.includes(waist) ? prev.filter((w) => w !== waist) : [...prev, waist]
                              );
                            }}
                            className="rounded-xs border-stone-300 dark:border-zinc-700 text-zinc-950 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{waist}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-mono">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Color Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('color')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Color Palette</span>
                {openSections.color ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.color && (
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {COLOR_FILTERS.map((c) => {
                    const isSelected = selectedColors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedColors((prev) =>
                            prev.includes(c.name) ? prev.filter((col) => col !== c.name) : [...prev, c.name]
                          );
                        }}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-full border mb-1 transition-all ${
                            isSelected
                              ? 'border-zinc-950 dark:border-white ring-2 ring-zinc-950 dark:ring-white scale-110'
                              : 'border-stone-300 dark:border-zinc-700 group-hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className={`text-[10px] truncate max-w-full ${
                          isSelected ? 'font-semibold text-zinc-950 dark:text-white' : 'text-stone-500 dark:text-zinc-400'
                        }`}>
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Size Accordion */}
            <div className="border-b border-stone-200 dark:border-zinc-800 pb-4">
              <button
                onClick={() => toggleSection('size')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Size Range</span>
                {openSections.size ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.size && (
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-400 dark:text-zinc-500 block mb-1.5">
                      Standard Clothing
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {CLOTHING_SIZES.map((sz) => {
                        const isSelected = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            onClick={() => {
                              setSelectedSizes((prev) =>
                                prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
                              );
                            }}
                            className={`py-1.5 text-xs font-medium border text-center transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                                : 'border-stone-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-400 dark:text-zinc-500 block mb-1.5">
                      Waist &amp; Denim Inseams
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {WAIST_SIZES.map((sz) => {
                        const isSelected = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            onClick={() => {
                              setSelectedSizes((prev) =>
                                prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
                              );
                            }}
                            className={`py-1.5 text-xs font-medium border text-center transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                                : 'border-stone-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sustainability Badges Accordion */}
            <div className="pb-4">
              <button
                onClick={() => toggleSection('sustainability')}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 py-1 cursor-pointer"
              >
                <span>Ethical Certifications</span>
                {openSections.sustainability ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.sustainability && (
                <div className="mt-3 space-y-2 text-xs">
                  {SUSTAINABILITY_OPTIONS.map((badge) => {
                    const isChecked = selectedSustainability.includes(badge);
                    const count = getSustainabilityCount(badge);
                    return (
                      <label
                        key={badge}
                        className="flex items-center justify-between text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedSustainability((prev) =>
                                prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
                              );
                            }}
                            className="rounded-xs border-stone-300 dark:border-zinc-700 text-zinc-950 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] truncate max-w-[170px]">{badge}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-mono">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Catalog Area */}
        <main className="flex-1 min-w-0">
          {/* Title and Sort Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-4 border-b border-stone-200 dark:border-zinc-800 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white uppercase">
                {selectedCategory === 'All' ? `${department}'s Timeless Garments` : selectedCategory}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
                Radical Transparency with certified factory audits and true production cost breakdowns.
              </p>
            </div>

            {/* Mobile Filter Toggle & Sort Dropdown */}
            <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters ({filteredProducts.length})</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-500 dark:text-zinc-400 hidden sm:inline font-medium">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border border-stone-300 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 py-1.5 px-3 rounded-none focus:outline-none focus:border-zinc-950 dark:focus:border-white cursor-pointer"
                >
                  <option value="featured" className="dark:bg-zinc-900">Featured Curations</option>
                  <option value="savings" className="dark:bg-zinc-900">Greatest Retail Savings (₹)</option>
                  <option value="price-asc" className="dark:bg-zinc-900">Price: Low to High</option>
                  <option value="price-desc" className="dark:bg-zinc-900">Price: High to Low</option>
                  <option value="rating" className="dark:bg-zinc-900">Highest Customer Rating</option>
                  <option value="newest" className="dark:bg-zinc-900">Newest Releases</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {selectedCategory !== 'All' && selectedCategory !== 'Clothing' && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>Category: <strong>{selectedCategory}</strong></span>
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 border border-emerald-200 dark:border-emerald-800">
                  <span>In Stock Only</span>
                  <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {selectedCategories.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>{c}</span>
                  <button onClick={() => setSelectedCategories((prev) => prev.filter((item) => item !== c))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedFabrics.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>Fabric: {f}</span>
                  <button onClick={() => setSelectedFabrics((prev) => prev.filter((item) => item !== f))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedFits.map((fit) => (
                <span key={fit} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>Fit: {fit}</span>
                  <button onClick={() => setSelectedFits((prev) => prev.filter((item) => item !== fit))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedWaistbands.map((w) => (
                <span key={w} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>Rise: {w}</span>
                  <button onClick={() => setSelectedWaistbands((prev) => prev.filter((item) => item !== w))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedColors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>Color: {c}</span>
                  <button onClick={() => setSelectedColors((prev) => prev.filter((item) => item !== c))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedSizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                  <span>Size: {s}</span>
                  <button onClick={() => setSelectedSizes((prev) => prev.filter((item) => item !== s))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedPriceRanges.map((pr) => {
                const label = PRICE_RANGES.find((item) => item.id === pr)?.label || pr;
                return (
                  <span key={pr} className="inline-flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 border border-stone-200 dark:border-zinc-700">
                    <span>{label}</span>
                    <button onClick={() => setSelectedPriceRanges((prev) => prev.filter((item) => item !== pr))} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-stone-500 hover:text-zinc-950 dark:hover:text-white underline ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid: 3 columns on desktop matching reference image */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stock={inventoryState[product.id] ?? product.stock}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center flex flex-col items-center bg-stone-50 dark:bg-zinc-900/40 p-8 border border-stone-200 dark:border-zinc-800">
              <p className="text-base font-medium text-stone-700 dark:text-zinc-300 mb-2">
                No timeless pieces found matching your current filter selections.
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mb-6 max-w-md">
                Try widening your fabric, size, or price filters to explore our full ethical production line.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs uppercase font-bold tracking-widest cursor-pointer shadow-xs hover:bg-zinc-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-[#121214] h-full p-6 overflow-y-auto z-10 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-zinc-800 mb-4">
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Refine Wardrobe</span>
                <span className="block text-[11px] text-stone-500">{filteredProducts.length} Pieces Available</span>
              </div>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1 pr-1">
              {/* In Stock toggle */}
              <div className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-zinc-800">
                <span className="text-xs font-semibold">In Stock Only</span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                    inStockOnly ? 'bg-zinc-950 dark:bg-white' : 'bg-stone-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 transition translate-y-0.5 ${
                      inStockOnly ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Categories */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-zinc-900 dark:text-white">Category</span>
                <div className="space-y-2 text-xs">
                  {['Tees & Tops', 'Denim & Trousers', 'Sweaters & Cashmere', 'Outerwear & Coats', 'Dresses & Jumpsuits', 'Footwear & Accessories'].map((cat) => (
                    <label key={cat} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                            );
                          }}
                          className="rounded-xs"
                        />
                        <span>{cat}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">({getCategoryCount(cat)})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-zinc-900 dark:text-white">Material</span>
                <div className="space-y-2 text-xs">
                  {FABRIC_OPTIONS.map((fabric) => (
                    <label key={fabric} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(fabric)}
                          onChange={() => {
                            setSelectedFabrics((prev) =>
                              prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
                            );
                          }}
                          className="rounded-xs"
                        />
                        <span>{fabric}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">({getFabricCount(fabric)})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-zinc-900 dark:text-white">Clothing Size</span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {CLOTHING_SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSizes((prev) =>
                          prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
                        );
                      }}
                      className={`p-1.5 border text-center font-medium ${
                        selectedSizes.includes(sz) ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'border-stone-200 dark:border-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-zinc-800 mt-6 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-stone-300 dark:border-zinc-700 text-xs uppercase font-bold tracking-wider cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs uppercase font-bold tracking-wider cursor-pointer shadow-xs"
              >
                Show {filteredProducts.length} Pieces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
