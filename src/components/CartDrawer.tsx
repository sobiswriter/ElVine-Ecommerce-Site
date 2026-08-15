import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  AlertCircle,
  Truck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  stockMap?: Record<string, number>;
  products?: Product[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout?: () => void;
  onProceedToCheckout?: (discountAmount: number, promoCode: string) => void;
  onBrowseMore?: () => void;
  onSelectProduct: (p: Product) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items = [],
  stockMap = {},
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onProceedToCheckout,
  onBrowseMore,
  onSelectProduct,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent?: number; fixed?: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const FREE_SHIPPING_THRESHOLD = 8000;

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  // Compute traditional retail total and savings
  const totalTraditionalRetail = items.reduce((sum, item) => {
    const tradPrice = item.product?.transparentCost?.traditionalRetailPrice || (item.product?.price ? item.product.price * 2.2 : 0);
    return sum + (tradPrice * item.quantity);
  }, 0);
  const totalSavedVsTraditional = Math.max(0, totalTraditionalRetail - subtotal);

  // Discount computation
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.percent) {
      discount = (subtotal * appliedPromo.percent) / 100;
    } else if (appliedPromo.fixed) {
      discount = Math.min(subtotal, appliedPromo.fixed);
    }
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 490;
  const estimatedTax = subtotal > 0 ? Math.round((subtotal - discount) * 0.05) : 0;
  const total = Math.max(0, subtotal - discount + shipping + estimatedTax);

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();

    if (!code) return;

    if (code === 'TRANSPARENT10') {
      setAppliedPromo({ code, percent: 10 });
      setPromoInput('');
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code, fixed: 1500 });
      setPromoInput('');
    } else if (code === 'ELVINE') {
      setAppliedPromo({ code, percent: 15 });
      setPromoInput('');
    } else {
      setPromoError('Invalid code. Try "TRANSPARENT10" or "ELVINE"');
    }
  };

  const handleCheckoutClick = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout(discount, appliedPromo?.code || '');
    } else if (onCheckout) {
      onCheckout();
    }
  };

  const handleContinueBrowsing = () => {
    if (onBrowseMore) {
      onBrowseMore();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#121214] border-l border-stone-200 dark:border-zinc-800 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 block">
                  Radical Transparency
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <span>Your Wardrobe Bag</span>
                  <span className="text-xs font-normal text-stone-500 font-mono">
                    ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close bag"
                className="p-2 text-stone-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            <div className="px-5 sm:px-6 py-3 bg-[#f7f6f2] dark:bg-[#18181b] border-b border-stone-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center justify-between font-medium text-zinc-800 dark:text-zinc-200 mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Truck className="w-3.5 h-3.5 text-stone-600 dark:text-zinc-400" />
                  <span>
                    {amountToFreeShipping > 0
                      ? `Add ₹${amountToFreeShipping.toLocaleString('en-IN')} more for Free Carbon-Neutral Shipping`
                      : 'Complimentary Carbon-Neutral Shipping Unlocked!'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-stone-500">{freeShippingProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Items or Empty State */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-stone-400">
                    <ShoppingBag className="w-6 h-6 stroke-1" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-xs mt-1 mb-5">
                    Explore our heirloom-grade Grade-A cashmere, selvedge denim, French linen, and organic Pima staples.
                  </p>
                  <button
                    onClick={handleContinueBrowsing}
                    className="px-6 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const stockNumber = (stockMap && item.productId && stockMap[item.productId] !== undefined)
                    ? stockMap[item.productId]
                    : (item.product?.stock ?? 10);
                  const isMaxStockReached = item.quantity >= stockNumber;

                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:p-4 rounded-xl bg-[#faf9f6] dark:bg-[#18181b] border border-stone-200 dark:border-zinc-800/80 flex gap-3.5"
                    >
                      {/* Thumbnail */}
                      <div
                        onClick={() => {
                          if (item.product) {
                            onSelectProduct(item.product);
                            onClose();
                          }
                        }}
                        className="w-18 h-22 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-800 shrink-0 cursor-pointer"
                      >
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                          alt={item.product?.title || 'Garment'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-500 dark:text-zinc-400 block">
                                {item.product?.fabric || 'Sustainable Fabric'}
                              </span>
                              <h4
                                onClick={() => {
                                  if (item.product) {
                                    onSelectProduct(item.product);
                                    onClose();
                                  }
                                }}
                                className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white hover:underline cursor-pointer line-clamp-1"
                              >
                                {item.product?.title || 'Product'}
                              </h4>
                            </div>
                            <span className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-white font-mono whitespace-nowrap">
                              ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Variants */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500 dark:text-zinc-400 mt-1">
                            {item.selectedColor && (
                              <span className="bg-stone-200/60 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded font-medium">
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="bg-stone-200/60 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded font-medium">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.product?.transparentCost?.totalTrueCost && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                (Cost ₹{item.product.transparentCost.totalTrueCost.toLocaleString('en-IN')})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-stone-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="p-1 rounded text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-zinc-950 dark:text-white font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isMaxStockReached}
                              aria-label="Increase quantity"
                              className="p-1 rounded text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            aria-label="Remove item"
                            className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer & Checkout Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-stone-200 dark:border-zinc-800 bg-[#faf9f6] dark:bg-[#151517] space-y-3.5">
                {/* Transparency Savings Banner */}
                {totalSavedVsTraditional > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Traditional Retail Savings
                    </span>
                    <span className="font-bold font-mono">₹{totalSavedVsTraditional.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Promo code (e.g. TRANSPARENT10)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs uppercase font-medium bg-white dark:bg-zinc-800 rounded border border-stone-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold rounded hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <span className="flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> "{appliedPromo.code}" Applied
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-stone-400 hover:text-stone-600 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <p className="text-[10px] text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {promoError}
                    </p>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-400 pt-1 border-t border-stone-200 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-950 dark:text-white font-mono">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                      <span>Discount ({appliedPromo?.code})</span>
                      <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-zinc-950 dark:text-white">
                      {shipping === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">Free</span>
                      ) : (
                        `₹${shipping.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 dark:border-zinc-800 text-sm font-bold text-zinc-950 dark:text-white">
                    <span>Estimated Total</span>
                    <span className="text-base font-mono font-bold">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  id="cart-proceed-checkout-btn"
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>Proceed to 1-Click Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
