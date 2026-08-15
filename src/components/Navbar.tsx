import React from 'react';
import { Search, ShoppingBag, Heart, Moon, Sun, Sparkles, User, ShieldCheck } from 'lucide-react';
import { ActiveTab, Department } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  department: Department;
  setDepartment: (dept: Department) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  cartCount: number;
  wishlistCount: number;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenSearch: () => void;
  onOpenConcierge: () => void;
  onOpenCart: () => void;
  onGoHome: () => void;
}

export const SUB_CATEGORIES = [
  'New Arrivals',
  'Best Sellers',
  'Clothing',
  'Pants',
  'Jeans',
  'Tees',
  'Dresses',
  'Sweaters',
  'Shoes & Bags',
  'Sale',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  department,
  setDepartment,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  wishlistCount,
  isDark,
  setIsDark,
  onOpenSearch,
  onOpenConcierge,
  onOpenCart,
  onGoHome,
}) => {
  return (
    <header id="main-navbar" className="sticky top-0 z-40 w-full bg-white dark:bg-[#0f0f10] border-b border-stone-200 dark:border-zinc-800 transition-colors duration-200">
      {/* Top Banner */}
      <div className="bg-[#f5f4f0] dark:bg-[#18181b] text-zinc-800 dark:text-zinc-200 py-1.5 px-4 text-[11px] tracking-wide border-b border-stone-200 dark:border-zinc-800 text-center font-normal">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-1.5 text-stone-500 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block"></span>
            <span>ElVine • Radical Transparency Since 2010</span>
          </div>
          <p className="text-center mx-auto sm:mx-0 font-medium">
            <span className="font-semibold">The Seasonal Event:</span> 20% off orders over ₹12,000 | Free Carbon-Neutral Shipping over ₹8,000
          </p>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setActiveTab('transparency')}
              className="text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Factory Audits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Department Tabs */}
          <nav className="flex items-center space-x-6 sm:space-x-8 text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
            <button
              id="dept-women-btn"
              onClick={() => {
                setDepartment('Women');
                setActiveTab('browse');
              }}
              className={`py-4 transition-colors relative cursor-pointer ${
                department === 'Women' && activeTab === 'browse'
                  ? 'text-zinc-950 dark:text-white font-semibold'
                  : 'hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Women
              {department === 'Women' && activeTab === 'browse' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-950 dark:bg-white" />
              )}
            </button>

            <button
              id="dept-men-btn"
              onClick={() => {
                setDepartment('Men');
                setActiveTab('browse');
              }}
              className={`py-4 transition-colors relative cursor-pointer ${
                department === 'Men' && activeTab === 'browse'
                  ? 'text-zinc-950 dark:text-white font-semibold'
                  : 'hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Men
              {department === 'Men' && activeTab === 'browse' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-950 dark:bg-white" />
              )}
            </button>

            <button
              id="dept-about-btn"
              onClick={() => {
                setActiveTab('transparency');
              }}
              className={`py-4 transition-colors relative cursor-pointer hidden md:inline-block ${
                activeTab === 'transparency'
                  ? 'text-zinc-950 dark:text-white font-semibold'
                  : 'hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              About
              {activeTab === 'transparency' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-950 dark:bg-white" />
              )}
            </button>

            <button
              id="dept-stories-btn"
              onClick={() => {
                setActiveTab('transparency');
              }}
              className="py-4 transition-colors relative cursor-pointer text-stone-500 hover:text-zinc-950 dark:hover:text-white hidden lg:inline-block"
            >
              ElVine Stories
            </button>
          </nav>

          {/* Center: Brand Logo (E L V I N E) */}
          <div className="flex-1 flex justify-center">
            <button
              id="brand-logo-btn"
              onClick={onGoHome}
              className="group cursor-pointer text-center"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-zinc-950 dark:text-white select-none">
                ELVINE
              </span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-zinc-700 dark:text-zinc-300">
            {/* Search */}
            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              aria-label="Search catalog"
              className="p-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            {/* AI Capsule Concierge */}
            <button
              id="nav-concierge-btn"
              onClick={onOpenConcierge}
              aria-label="AI Capsule Stylist"
              title="AI Capsule Stylist"
              className="p-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer hidden sm:block"
            >
              <Sparkles className="w-[18px] h-[18px] text-stone-700 dark:text-stone-300" strokeWidth={1.75} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              className="p-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer hidden sm:block"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} /> : <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} />}
            </button>

            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              onClick={() => setActiveTab('wishlist')}
              aria-label="Wishlist"
              className="p-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors relative cursor-pointer hidden sm:block"
            >
              <Heart
                className={`w-[18px] h-[18px] ${
                  wishlistCount > 0 ? 'text-zinc-950 dark:text-white fill-zinc-950 dark:fill-white' : ''
                }`}
                strokeWidth={1.75}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account */}
            <button
              id="nav-account-btn"
              onClick={() => setActiveTab('account')}
              aria-label="My Account"
              className={`p-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer ${
                activeTab === 'account' ? 'text-zinc-950 dark:text-white' : ''
              }`}
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            {/* Shopping Bag */}
            <button
              id="nav-bag-btn"
              onClick={onOpenCart}
              aria-label="Shopping bag"
              className="p-1.5 hover:text-zinc-950 dark:hover:text-white transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Sub-Category Navigation Bar */}
        {activeTab === 'browse' && (
          <div className="border-t border-stone-100 dark:border-zinc-800/80 py-2.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-6 text-[12px] whitespace-nowrap">
              {SUB_CATEGORIES.map((subCat) => {
                const isSelected = selectedCategory === subCat;
                const isSale = subCat === 'Sale';
                return (
                  <button
                    key={subCat}
                    onClick={() => setSelectedCategory(subCat)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-zinc-950 dark:text-white font-semibold underline underline-offset-4'
                        : isSale
                        ? 'text-amber-800 dark:text-amber-400 font-medium hover:underline'
                        : 'text-stone-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {subCat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
