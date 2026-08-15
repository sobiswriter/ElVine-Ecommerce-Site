/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Factory,
  Layers,
  Sparkles,
  ArrowRight,
  Heart,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import { Navbar, SUB_CATEGORIES } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { EditorialHome } from './components/EditorialHome';
import { CatalogView } from './components/CatalogView';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SmartRecommendations } from './components/SmartRecommendations';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountTab } from './components/AccountTab';
import { SearchOverlay } from './components/SearchOverlay';
import { AIConciergeModal } from './components/AIConciergeModal';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, MOCK_USER, INITIAL_ORDERS, FACTORIES } from './data/mockProducts';
import {
  Product,
  Review,
  CartItem,
  Order,
  UserProfile,
  ActiveTab,
  Department,
  AIRecommendation,
} from './types';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('elvine_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('elvine_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('elvine_theme', 'light');
    }
  }, [isDark]);

  // Main State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [user, setUser] = useState<UserProfile>(MOCK_USER);

  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [department, setDepartment] = useState<Department>('Women');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elvine_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('elvine_wishlist');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2'];
    } catch {
      return ['prod-1', 'prod-2'];
    }
  });

  // History tracking for AI Recommendations
  const [searchHistory, setSearchHistory] = useState<{ query: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('elvine_search_history');
      return saved ? JSON.parse(saved) : [{ query: 'The Boxy Polo in Everyday Cotton', timestamp: Date.now() - 3600000 }];
    } catch {
      return [];
    }
  });

  const [browsingHistory, setBrowsingHistory] = useState<{ productId: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('elvine_browsing_history');
      return saved ? JSON.parse(saved) : [{ productId: 'prod-1', timestamp: Date.now() - 1800000 }];
    } catch {
      return [];
    }
  });

  // AI Recommendations
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  // Active Modals & Drawers
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('elvine_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('elvine_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('elvine_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('elvine_browsing_history', JSON.stringify(browsingHistory));
  }, [browsingHistory]);

  // Initial Real-time Inventory Fetch & Poll
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/inventory');
        if (res.ok) {
          const data = await res.json();
          setStockMap(data);
        }
      } catch {
        // Fallback to local stock
        const fallback: Record<string, number> = {};
        products.forEach((p) => {
          fallback[p.id] = p.stock;
        });
        setStockMap(fallback);
      }
    };

    fetchInventory();
    const interval = setInterval(fetchInventory, 12000);
    return () => clearInterval(interval);
  }, [products]);

  // Generate Smart AI Recommendations based on search & browsing history
  const fetchSmartRecommendations = useCallback(async () => {
    setIsRecsLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          browsingHistory,
          searchHistory,
          wishlist,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setRecommendations(data);
          setIsRecsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Heuristic Fallback
    const complementary = products.filter(
      (p) => !browsingHistory.some((bh) => bh.productId === p.id)
    ).slice(0, 4);

    setRecommendations(
      complementary.map((p, idx) => ({
        productId: p.id,
        reason: idx % 2 === 0 ? 'Pairs with your organic cotton staples' : 'Curated for capsule wardrobe layering',
        matchScore: 92 - idx * 3,
        contextTag: p.fabric,
      }))
    );
    setIsRecsLoading(false);
  }, [browsingHistory, searchHistory, wishlist, products]);

  useEffect(() => {
    fetchSmartRecommendations();
  }, [fetchSmartRecommendations]);

  // Handler: Select Product (opens PDP modal & logs history)
  const handleSelectProduct = (product: Product) => {
    setInspectedProduct(product);
    setBrowsingHistory((prev) => {
      const filtered = prev.filter((item) => item.productId !== product.id);
      return [{ productId: product.id, timestamp: Date.now() }, ...filtered].slice(0, 20);
    });
  };

  // Handler: Toggle Wishlist
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed "${product.title}" from Wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Added "${product.title}" to Wishlist`);
        return [...prev, product.id];
      }
    });
  };

  // Handler: Add to Cart
  const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    const chosenColor = color || product.colors[0]?.name;
    const chosenSize = size || product.sizes[0] || 'M';
    const itemId = `${product.id}-${chosenColor}-${chosenSize}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            product,
            quantity,
            selectedColor: chosenColor,
            selectedSize: chosenSize,
          },
        ];
      }
    });

    showToast(`Added ${quantity}x "${product.title}" to your Bag`);
    setIsCartOpen(true);
  };

  // Handler: Update Cart Quantity
  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  // Handler: Instant 1-Click Buy
  const handleInstantBuy = (product: Product, quantity = 1, color?: string, size?: string) => {
    handleAddToCart(product, quantity, color, size);
    setInspectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Handler: Add Review
  const handleAddReview = async (reviewData: Partial<Review>) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        showToast('Thank you for submitting your verified review.');
      }
    } catch {
      const fallbackReview: Review = {
        id: `rev-${Date.now()}`,
        productId: reviewData.productId || 'prod-1',
        author: reviewData.author || user.name,
        avatar: user.avatar,
        rating: reviewData.rating || 5,
        date: 'Just now',
        title: reviewData.title || '',
        comment: reviewData.comment || '',
        verified: true,
        helpfulVotes: 0,
        sizePurchased: reviewData.sizePurchased,
        fitRating: reviewData.fitRating,
      };
      setReviews((prev) => [fallbackReview, ...prev]);
      showToast('Thank you for submitting your verified review.');
    }
  };

  // Handler: Vote Helpful
  const handleVoteHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const userVoted = r.userVotedHelpful;
          return {
            ...r,
            helpfulVotes: userVoted ? r.helpfulVotes - 1 : r.helpfulVotes + 1,
            userVotedHelpful: !userVoted,
          };
        }
        return r;
      })
    );
  };

  // Handler: Place Order
  const handlePlaceOrder = async (orderPayload: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        const created = await res.json();
        setOrders((prev) => [created, ...prev]);
      }
    } catch {
      const fallbackOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `ELV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Processing',
        items: orderPayload.items,
        subtotal: orderPayload.subtotal,
        discount: orderPayload.discount,
        shipping: orderPayload.shipping,
        tax: orderPayload.tax,
        total: orderPayload.total,
        totalSavedVsTraditional: orderPayload.totalSavedVsTraditional,
        shippingAddress: orderPayload.shippingAddress,
        paymentMethod: orderPayload.paymentMethod,
        trackingNumber: '1Z' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        estimatedDelivery: '3-5 business days',
      };
      setOrders((prev) => [fallbackOrder, ...prev]);
    }

    // Clear cart and close checkout
    setCart([]);
    setIsCheckoutOpen(false);
    showToast('Order confirmed! Tracking details sent to your email.');
    setActiveTab('account');
  };

  // Total cart items
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f0f10] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-3 text-xs font-medium tracking-wide shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        department={department}
        setDepartment={setDepartment}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('browse');
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => {
          setActiveTab('browse');
          setSelectedCategory('All');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full pb-20 sm:pb-12">
        {/* VIEW 1: BROWSE / EDITORIAL / CATALOG */}
        {activeTab === 'browse' && (
          <div>
            {selectedCategory === 'All' ? (
              <div>
                <EditorialHome
                  products={products}
                  inventoryState={stockMap}
                  wishlist={wishlist}
                  department={department}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={handleSelectProduct}
                  onNavigateToCategory={(cat) => setSelectedCategory(cat)}
                  onOpenTransparency={() => setActiveTab('transparency')}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <SmartRecommendations
                    recommendations={recommendations}
                    products={products}
                    stockMap={stockMap}
                    isLoading={isRecsLoading}
                    onRefresh={fetchSmartRecommendations}
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onOpenConcierge={() => setIsConciergeOpen(true)}
                    hasHistory={browsingHistory.length > 0 || searchHistory.length > 0}
                  />
                </div>
              </div>
            ) : (
              <CatalogView
                products={products}
                inventoryState={stockMap}
                wishlist={wishlist}
                department={department}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={handleSelectProduct}
              />
            )}
          </div>
        )}

        {/* VIEW 2: RADICAL TRANSPARENCY & FACTORIES */}
        {activeTab === 'transparency' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="max-w-3xl mb-12">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-stone-500 dark:text-zinc-400">
                Ethical Fashion / Est. 2010
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white mt-1 mb-4">
                Radical Transparency
              </h1>
              <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed">
                Traditional retail markups are 5x to 6x production cost. At ElVine, we believe you have the right to know what your clothes cost to make, who made them, and under what conditions.
              </p>
            </div>

            {/* True Cost Breakdown Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 p-8 bg-[#f5f4f0] dark:bg-[#141416] border border-stone-200 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">
                  Our Direct-to-Consumer Model
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed mb-4">
                  By eliminating middleman markups, wholesale fees, and excessive advertising overhead, we offer heirloom-grade Italian cashmere, Japanese selvedge denim, and French linen at true, accessible prices.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-stone-300 dark:border-zinc-700">
                    <span className="text-stone-600 dark:text-zinc-400">Raw Materials &amp; Sustainable Yarn</span>
                    <span className="font-semibold text-zinc-950 dark:text-white">~45% of True Cost</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-300 dark:border-zinc-700">
                    <span className="text-stone-600 dark:text-zinc-400">Living Wage Artisan Labor</span>
                    <span className="font-semibold text-zinc-950 dark:text-white">~35% of True Cost</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-300 dark:border-zinc-700">
                    <span className="text-stone-600 dark:text-zinc-400">Hardware &amp; Natural Buttons</span>
                    <span className="font-semibold text-zinc-950 dark:text-white">~8% of True Cost</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-600 dark:text-zinc-400">Carbon-Neutral Freight &amp; Duties</span>
                    <span className="font-semibold text-zinc-950 dark:text-white">~12% of True Cost</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-stone-300 dark:border-zinc-700 pt-6 md:pt-0 md:pl-8">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-zinc-400 mb-1">
                  Example: The Grade-A Cashmere Crewneck
                </span>
                <div className="flex items-baseline gap-4 my-3">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white">₹11,900</span>
                    <span className="block text-[11px] text-stone-500">ElVine Price</span>
                  </div>
                  <div className="text-stone-300 dark:text-zinc-700 text-xl font-light">vs</div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-stone-400 dark:text-zinc-600 line-through">₹25,600</span>
                    <span className="block text-[11px] text-stone-500">Traditional Retail</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  True production cost: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">₹5,760</strong> (Spun &amp; knitted in Ulaanbaatar, Mongolia at a living wage cooperative).
                </p>
              </div>
            </div>

            {/* Audited Ethical Factories */}
            <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white mb-6">
              Our Certified Partner Mills &amp; Ateliers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.values(FACTORIES).map((factory) => (
                <div
                  key={factory.id}
                  className="flex flex-col border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
                    <img
                      src={factory.image}
                      alt={factory.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 px-2 py-0.5 text-xs font-semibold flex items-center gap-1.5">
                      <span>{factory.countryFlag}</span>
                      <span>{factory.location}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5">
                        Audit Score: {factory.auditScore}%
                      </span>
                      <span className="text-xs text-stone-500 dark:text-zinc-400 font-mono">
                        Est. {factory.established}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-2">
                      {factory.name}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed mb-4 flex-1">
                      {factory.description}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-stone-500 dark:text-zinc-400">
                      <div>Living Wage: <strong className="text-zinc-800 dark:text-zinc-200">{factory.workingConditions.livingWage}</strong></div>
                      <div>Energy: <strong className="text-zinc-800 dark:text-zinc-200">{factory.workingConditions.renewableEnergy}</strong></div>
                      <div>Water/Waste: <strong className="text-zinc-800 dark:text-zinc-200">{factory.workingConditions.wasteRecycled}</strong></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-stone-200 dark:border-zinc-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  My Wishlist ({wishlist.length})
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
                  Saved timeless pieces for your future forever wardrobe.
                </p>
              </div>
              {wishlist.length > 0 && (
                <button
                  onClick={() => setWishlist([])}
                  className="text-xs text-stone-500 hover:text-zinc-950 dark:hover:text-white underline cursor-pointer"
                >
                  Clear Wishlist
                </button>
              )}
            </div>

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products
                  .filter((p) => wishlist.includes(p.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      stock={stockMap[product.id] ?? product.stock}
                      isWishlisted={true}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectProduct={handleSelectProduct}
                    />
                  ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <Heart className="w-12 h-12 text-stone-300 dark:text-zinc-700 mb-4 stroke-1" />
                <p className="text-base text-stone-600 dark:text-zinc-400 mb-6">
                  Your wishlist is currently empty.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('browse');
                    setSelectedCategory('All');
                  }}
                  className="px-6 py-3 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs uppercase font-bold tracking-widest cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: ACCOUNT */}
        {activeTab === 'account' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AccountTab
              user={user}
              orders={orders}
              products={products}
              allProducts={products}
              searchHistory={searchHistory}
              browsingHistory={browsingHistory}
              isDark={isDark}
              setIsDark={setIsDark}
              onClearHistory={() => {
                setSearchHistory([]);
                setBrowsingHistory([]);
              }}
              onSelectProduct={handleSelectProduct}
              onReorderItem={(productId, color, size) => {
                const prod = products.find((p) => p.id === productId);
                if (prod) handleAddToCart(prod, 1, color, size);
              }}
              onOpenCart={() => setIsCartOpen(true)}
              onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            />
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        stockMap={stockMap}
        products={products}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={(itemId) => handleUpdateCartQuantity(itemId, 0)}
        onProceedToCheckout={(discountAmount, promoCode) => {
          setCheckoutDiscount(discountAmount);
          setCheckoutPromoCode(promoCode);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onBrowseMore={() => {
          setIsCartOpen(false);
          setActiveTab('browse');
          setSelectedCategory('All');
        }}
        onSelectProduct={handleSelectProduct}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        user={user}
        initialDiscount={checkoutDiscount}
        initialPromoCode={checkoutPromoCode}
        onClose={() => setIsCheckoutOpen(false)}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        product={inspectedProduct}
        stock={inspectedProduct ? stockMap[inspectedProduct.id] ?? inspectedProduct.stock : 0}
        isWishlisted={inspectedProduct ? wishlist.includes(inspectedProduct.id) : false}
        reviews={reviews}
        allProducts={products}
        onClose={() => setInspectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onInstantBuy={handleInstantBuy}
        onAddReview={handleAddReview}
        onVoteHelpful={handleVoteHelpful}
        onSelectRelated={handleSelectProduct}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        products={products}
        searchHistory={searchHistory}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => {
          handleSelectProduct(p);
          setIsSearchOpen(false);
        }}
        onSearchSubmit={(q) => {
          setSearchHistory((prev) => [
            { query: q, timestamp: Date.now() },
            ...prev.filter((item) => item.query.toLowerCase() !== q.toLowerCase()),
          ].slice(0, 10));
        }}
        onClearHistory={() => setSearchHistory([])}
      />

      {/* AI Capsule Concierge Modal */}
      <AIConciergeModal
        isOpen={isConciergeOpen}
        products={products}
        browsingHistory={browsingHistory}
        searchHistory={searchHistory}
        wishlist={wishlist}
        onClose={() => setIsConciergeOpen(false)}
        onSelectProduct={(p) => {
          handleSelectProduct(p);
          setIsConciergeOpen(false);
        }}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'cart') {
            setIsCartOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenConcierge={() => setIsConciergeOpen(true)}
      />

      {/* Footer */}
      <footer className="w-full bg-[#f5f4f0] dark:bg-[#121214] border-t border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <span className="font-semibold text-zinc-950 dark:text-white uppercase tracking-wider text-[11px] block mb-3">
              About ElVine
            </span>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('transparency')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Radical Transparency</button></li>
              <li><button onClick={() => setActiveTab('transparency')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Our Certified Factories</button></li>
              <li><button onClick={() => setActiveTab('transparency')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Environmental Initiatives</button></li>
              <li><button onClick={() => setActiveTab('transparency')} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Careers</button></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-zinc-950 dark:text-white uppercase tracking-wider text-[11px] block mb-3">
              Help &amp; Support
            </span>
            <ul className="space-y-2">
              <li><span className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Shipping &amp; Carbon Neutral Delivery</span></li>
              <li><span className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Returns &amp; Exchanges</span></li>
              <li><span className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Size Guide &amp; Fit Assistant</span></li>
              <li><span className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Contact Concierge</span></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-zinc-950 dark:text-white uppercase tracking-wider text-[11px] block mb-3">
              Capsule Wardrobe
            </span>
            <ul className="space-y-2">
              <li><button onClick={() => { setSelectedCategory('Tees'); setActiveTab('browse'); }} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">The Organic Tee Guide</button></li>
              <li><button onClick={() => { setSelectedCategory('Jeans'); setActiveTab('browse'); }} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">The Denim Fit Matrix</button></li>
              <li><button onClick={() => { setSelectedCategory('Sweaters'); setActiveTab('browse'); }} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer">Grade-A Cashmere Care</button></li>
              <li><button onClick={() => setIsConciergeOpen(true)} className="hover:text-zinc-950 dark:hover:text-white cursor-pointer flex items-center gap-1"><Sparkles className="w-3 h-3 text-stone-500" /> AI Stylist Advice</button></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-zinc-950 dark:text-white uppercase tracking-wider text-[11px] block mb-3">
              Stay in Touch
            </span>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 mb-3">
              Sign up for early factory release drops and radical transparency reports.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email address"
                className="bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 px-3 py-2 text-xs flex-1 rounded-none focus:outline-none focus:border-zinc-950 dark:focus:border-white"
              />
              <button
                onClick={() => showToast('Subscribed to ElVine Radical Transparency updates')}
                className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-2 text-xs uppercase font-bold tracking-wider cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-stone-300 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} ElVine Apparel Co. All rights reserved. Radical Transparency® is a registered trademark.</p>
          <div className="flex space-x-6 text-stone-500 dark:text-zinc-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Supply Chain Disclosure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
