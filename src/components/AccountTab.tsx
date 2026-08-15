import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  History,
  Sliders,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  Shield,
  Plus,
  BookmarkCheck,
  DollarSign,
  Scale,
  Factory
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Order, Product } from '../types';

interface AccountTabProps {
  user: UserProfile;
  orders?: Order[];
  searchHistory?: { query: string; timestamp: number }[];
  browsingHistory?: { productId: string; timestamp: number }[];
  allProducts?: Product[];
  products?: Product[];
  isDark?: boolean;
  setIsDark?: (dark: boolean) => void;
  onClearHistory?: () => void;
  onSelectProduct: (p: Product) => void;
  onReorder?: (items: Order['items']) => void;
  onReorderItem?: (productId: string, color?: string, size?: string) => void;
  onOpenCart?: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  orders = [],
  searchHistory = [],
  browsingHistory = [],
  allProducts = [],
  products = [],
  isDark = false,
  setIsDark,
  onClearHistory,
  onSelectProduct,
  onReorder,
  onReorderItem,
  onOpenCart,
  onUpdateUser,
}) => {
  const [activeSection, setActiveSection] = useState<'orders' | 'profile' | 'addresses' | 'saved_info' | 'history' | 'preferences'>('orders');
  const [saveFastCheckout, setSaveFastCheckout] = useState(user?.saveInfoForFastCheckout ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const productCatalog = allProducts.length > 0 ? allProducts : products;

  // Compute lifetime savings across all orders
  const lifetimeSavings = (orders || []).reduce((sum, ord) => sum + (ord.totalSavedVsTraditional || 0), 0);
  const totalGarmentsOwned = (orders || []).reduce((sum, ord) => sum + (ord.items || []).reduce((s, i) => s + (i.quantity || 1), 0), 0);

  const handleToggleFastCheckout = (checked: boolean) => {
    setSaveFastCheckout(checked);
    if (onUpdateUser) {
      onUpdateUser({ saveInfoForFastCheckout: checked });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div id="account-tab-container" className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Profile Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-100 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-stone-300 dark:border-zinc-700 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded">
                {user.tier}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">{user.email}</p>
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">ElVine Member since {user.memberSince}</p>
          </div>
        </div>

        {/* Lifetime Transparency Impact Stats */}
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-3.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs">
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-bold block">Radical Transparency Savings</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
              ₹{lifetimeSavings > 0 ? lifetimeSavings.toLocaleString('en-IN') : '28,400'} Saved
            </span>
            <span className="text-[10px] text-stone-400 block">Across {totalGarmentsOwned > 0 ? totalGarmentsOwned : '4'} Forever Pieces</span>
          </div>
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-stone-200 dark:border-zinc-800">
        {[
          { id: 'orders' as const, label: 'Order History', icon: Package, badge: orders.length },
          { id: 'saved_info' as const, label: 'Fast 1-Click Checkout & Info', icon: BookmarkCheck },
          { id: 'addresses' as const, label: 'Saved Addresses', icon: MapPin },
          { id: 'history' as const, label: 'Wardrobe & Browsing History', icon: History },
          { id: 'preferences' as const, label: 'Preferences', icon: Sliders },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
              {sec.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-900' : 'bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                }`}>
                  {sec.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Orders */}
      {activeSection === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Orders & Parcel Tracking
            </h2>
            <span className="text-xs text-stone-500">{orders.length} orders on file</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 dark:bg-zinc-900/40 rounded-xl border border-stone-200 dark:border-zinc-800">
              <Package className="w-10 h-10 mx-auto text-stone-400 mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No orders placed yet</p>
              <p className="text-xs text-stone-400 mt-1">Your registered receipts and real-time tracking will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-4 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 mt-0.5 block">{ord.date}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-stone-400 block text-[10px]">Total Paid</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ₹{ord.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={() => onReorder(ord.items)}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded text-xs transition-colors cursor-pointer"
                      >
                        Reorder Pieces
                      </button>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/60 dark:border-zinc-800"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-14 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {item.color} • {item.size} • Qty: {item.quantity}
                          </p>
                          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch details */}
                  <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Shipped to: {ord.shippingAddress.city}, {ord.shippingAddress.state}
                    </span>
                    <span className="font-mono text-[11px]">
                      Carrier Tracking: {ord.trackingNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Saved Info & 1-Click Fast Checkout */}
      {activeSection === 'saved_info' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Save Your Info for Fast Checkout
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Enable instantaneous checkout on any timeless garment with your stored delivery address and payment preferences.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <BookmarkCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    Fast 1-Click Checkout Enabled
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Bypasses repetitive address and card entry at checkout.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveFastCheckout}
                  onChange={(e) => handleToggleFastCheckout(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100" />
              </label>
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Preferences updated successfully.
              </div>
            )}

            {/* Saved Payment Methods */}
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
                Stored Payment Methods
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-stone-600 dark:text-zinc-400" />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                          {pm.brand} •••• {pm.last4}
                        </span>
                        <span className="text-[10px] text-stone-500 block">Exp: {pm.expiry}</span>
                      </div>
                    </div>
                    {pm.isDefault && (
                      <span className="px-2 py-0.5 text-[9px] bg-stone-200 dark:bg-zinc-700 rounded font-bold">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Saved Addresses */}
      {activeSection === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Saved Shipping Destinations
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded text-xs font-bold cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 text-[10px] bg-stone-200 dark:bg-zinc-700 font-bold rounded">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                  {addr.fullName} <br />
                  {addr.street} <br />
                  {addr.city}, {addr.state} {addr.postalCode} <br />
                  {addr.country}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: AI Browsing & Search Data */}
      {activeSection === 'history' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Smart Capsule Wardrobe Model
                </h3>
                <p className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">
                  ElVine utilizes your fabric searches and inspected pieces to calculate garment compatibility in real time.
                </p>
              </div>
            </div>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white dark:bg-zinc-800 text-rose-600 text-xs font-bold border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Data
            </button>
          </div>

          {/* Search History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Recent Search Queries ({searchHistory.length})
            </h4>
            {searchHistory.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No search terms logged yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded bg-stone-100 dark:bg-zinc-800 text-xs font-medium text-stone-800 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700"
                  >
                    "{item.query}"
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Browsing History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Recently Inspected Garments ({browsingHistory.length})
            </h4>
            {browsingHistory.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No products viewed yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {browsingHistory.map((item) => {
                  const product = productCatalog.find((p) => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <div
                      key={item.productId}
                      onClick={() => onSelectProduct(product)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-stone-400 transition-colors cursor-pointer"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-12 h-14 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">
                          {product.fabric}
                        </span>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {product.title}
                        </p>
                        <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">₹{product.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: Preferences */}
      {activeSection === 'preferences' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Interface & Currency Preferences
          </h2>

          <div className="space-y-3">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Color Mode
                </span>
                <span className="text-[11px] text-stone-500">
                  Switch between Minimalist Light and Deep Dark modes
                </span>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-stone-100 dark:bg-zinc-800 rounded text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-zinc-700" />}
                <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
