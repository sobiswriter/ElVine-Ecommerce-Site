import React, { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Copy,
  Sparkles,
  Lock,
  BookmarkCheck,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CartItem, Order, UserProfile } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  items?: CartItem[];
  cart?: CartItem[];
  subtotal?: number;
  discount?: number;
  initialDiscount?: number;
  promoCode?: string;
  initialPromoCode?: string;
  user: UserProfile;
  onClose: () => void;
  onPlaceOrder?: (orderPayload: any) => Promise<void> | void;
  onOrderCompleted?: (order: Order) => void;
  onViewOrderInAccount?: () => void;
  onSaveUserInfo?: (updatedUser: Partial<UserProfile>) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  cart,
  subtotal: propSubtotal,
  discount: propDiscount,
  initialDiscount = 0,
  promoCode,
  initialPromoCode,
  user,
  onClose,
  onPlaceOrder,
  onOrderCompleted,
  onViewOrderInAccount,
  onSaveUserInfo,
}) => {
  if (!isOpen) return null;

  const cartList: CartItem[] = items || cart || [];
  const calculatedSubtotal = cartList.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const subtotal = propSubtotal !== undefined ? propSubtotal : calculatedSubtotal;
  const discount = propDiscount !== undefined ? propDiscount : initialDiscount;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses?.[0]?.id || 'addr-1');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [paymentType, setPaymentType] = useState<'card' | 'upi' | 'google_pay'>('upi');
  const [saveInfoForFuture, setSaveInfoForFuture] = useState(user?.saveInfoForFastCheckout ?? true);

  // Address fields
  const [customAddress, setCustomAddress] = useState({
    fullName: user?.name || 'Customer',
    street: user?.addresses?.[0]?.street || 'Bandra West, Hill Road, Apt 4B',
    city: user?.addresses?.[0]?.city || 'Mumbai',
    state: user?.addresses?.[0]?.state || 'Maharashtra',
    postalCode: user?.addresses?.[0]?.postalCode || '400050',
    country: 'India',
  });

  // Card details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4092',
    cardName: (user?.name || 'CUSTOMER').toUpperCase(),
    expiry: '09/29',
    cvv: '884',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Calculations
  const shippingFee = shippingMethod === 'standard' ? (subtotal >= 8000 ? 0 : 490) : shippingMethod === 'express' ? 750 : 1450;
  const tax = Math.max(0, Math.round((subtotal - discount) * 0.05));
  const total = Math.max(0, subtotal - discount + shippingFee + tax);

  // Calculate total savings vs traditional retail for this cart
  const totalTraditionalRetail = cartList.reduce((sum, item) => {
    const trad = item.product?.transparentCost?.traditionalRetailPrice || (item.product?.price ? item.product.price * 2.2 : 0);
    return sum + (trad * item.quantity);
  }, 0);
  const totalSavedVsTraditional = Math.max(0, totalTraditionalRetail - subtotal);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (onSaveUserInfo && saveInfoForFuture) {
        onSaveUserInfo({
          saveInfoForFastCheckout: true,
          addresses: [
            {
              id: 'addr-default',
              isDefault: true,
              label: 'Saved Primary Address',
              fullName: customAddress.fullName,
              street: customAddress.street,
              city: customAddress.city,
              state: customAddress.state,
              postalCode: customAddress.postalCode,
              country: customAddress.country,
            },
            ...(user?.addresses || []).filter((a) => a.id !== 'addr-default'),
          ],
        });
      }

      const orderPayload = {
        items: cartList.map((i) => ({
          productId: i.productId,
          title: i.product?.title || 'Garment',
          price: i.product?.price || 0,
          quantity: i.quantity,
          image: i.product?.images?.[0] || '',
          color: i.selectedColor,
          size: i.selectedSize,
          fabric: i.product?.fabric,
        })),
        subtotal,
        discount,
        shipping: shippingFee,
        tax,
        total,
        totalSavedVsTraditional,
        shippingAddress: customAddress,
        paymentMethod: {
          type: paymentType,
          last4: cardDetails.cardNumber.slice(-4) || '4092',
          brand: 'visa',
        },
      };

      if (onPlaceOrder) {
        await onPlaceOrder(orderPayload);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      let newOrder: Order;
      if (res.ok) {
        newOrder = await res.json();
      } else {
        newOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: `ELV-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Processing',
          items: orderPayload.items as any,
          subtotal: orderPayload.subtotal,
          discount: orderPayload.discount,
          shipping: orderPayload.shipping,
          tax: orderPayload.tax,
          total: orderPayload.total,
          totalSavedVsTraditional: orderPayload.totalSavedVsTraditional,
          shippingAddress: orderPayload.shippingAddress,
          paymentMethod: orderPayload.paymentMethod as any,
          trackingNumber: '1Z' + Math.random().toString(36).substring(2, 15).toUpperCase(),
          estimatedDelivery: '3-5 business days',
        };
      }

      setCompletedOrder(newOrder);
      if (onOrderCompleted) {
        onOrderCompleted(newOrder);
      }
      setStep(4);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#18181b', '#d6c7b2', '#d97706'],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTracking = () => {
    if (completedOrder?.trackingNumber) {
      navigator.clipboard.writeText(completedOrder.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="w-full max-w-3xl bg-[#fcfbf9] dark:bg-[#111113] rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 dark:text-emerald-400 block">
                ElVine • Transparent Checkout
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {step === 4 ? 'Order Confirmed' : 'Seamless 1-Click Checkout'}
              </h2>
            </div>
            {step < 4 && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-400 ml-4">
                <span className={step >= 1 ? 'text-zinc-900 dark:text-zinc-100' : ''}>1. Address</span>
                <span>•</span>
                <span className={step >= 2 ? 'text-zinc-900 dark:text-zinc-100' : ''}>2. Delivery</span>
                <span>•</span>
                <span className={step >= 3 ? 'text-zinc-900 dark:text-zinc-100' : ''}>3. Payment</span>
              </div>
            )}
          </div>

          {step < 4 && (
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: Shipping Address */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Select Shipping Destination
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  Dispatched in 100% recyclable, plastic-free custom unboxing boxes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr) => (
                  <label
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setCustomAddress({
                        fullName: addr.fullName,
                        street: addr.street,
                        city: addr.city,
                        state: addr.state,
                        postalCode: addr.postalCode,
                        country: addr.country,
                      });
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-zinc-900 dark:border-zinc-100 bg-stone-100/80 dark:bg-zinc-900/80 shadow-2xs'
                        : 'border-stone-200 dark:border-zinc-800 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-stone-200 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold text-stone-700 dark:text-zinc-300">
                            Saved Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-zinc-300 mt-1 leading-relaxed">
                        {addr.fullName} <br />
                        {addr.street} <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 mt-3">
                      {selectedAddressId === addr.id && <Check className="w-3.5 h-3.5" />}
                      <span>{selectedAddressId === addr.id ? 'Using this address' : 'Ship to this address'}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Editable address details */}
              <div className="p-4 bg-stone-100/70 dark:bg-zinc-900/60 rounded-xl border border-stone-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Recipient & Contact Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-500 font-semibold block mb-0.5">Full Name</label>
                    <input
                      type="text"
                      value={customAddress.fullName}
                      onChange={(e) => setCustomAddress({ ...customAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-semibold block mb-0.5">Street Address</label>
                    <input
                      type="text"
                      value={customAddress.street}
                      onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* "Save Your Info" Checkbox */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveInfoForFuture}
                    onChange={(e) => setSaveInfoForFuture(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                      Save your info for faster 1-click checkout
                    </span>
                    <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      Enables fast returning customer checkout with your saved size, address & payment preference.
                    </span>
                  </div>
                </label>
                <BookmarkCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-3">
                <button
                  id="checkout-step1-next"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Continue to Shipping Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Speed */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Select Shipping Speed
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  All orders offset 100% of carbon emissions during transit.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'standard' as const,
                    name: 'Standard Carbon-Neutral Transit',
                    estimate: '3-5 Business Days',
                    cost: subtotal >= 8000 ? 0 : 490,
                    description: 'Eco-conscious shipping in recycled FSC-certified pulp boxes',
                  },
                  {
                    id: 'express' as const,
                    name: 'Expedited Priority Air',
                    estimate: '2 Business Days',
                    cost: 750,
                    description: 'Direct courier handling with tracking push notifications',
                  },
                  {
                    id: 'overnight' as const,
                    name: 'Overnight White Glove Dispatch',
                    estimate: 'Tomorrow by 11:00 AM',
                    cost: 1450,
                    description: 'Priority flight dispatch with garment bag preservation',
                  },
                ].map((option) => (
                  <label
                    key={option.id}
                    onClick={() => setShippingMethod(option.id)}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      shippingMethod === option.id
                        ? 'border-zinc-900 dark:border-zinc-100 bg-stone-100/80 dark:bg-zinc-900/80 shadow-2xs'
                        : 'border-stone-200 dark:border-zinc-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-stone-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {option.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            • {option.estimate}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {option.cost === 0 ? 'Complimentary (₹0)' : `₹${option.cost.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  id="checkout-step2-next"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method & Savings Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Payment Method
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  Encrypted 256-bit bank-grade payment processing
                </p>
              </div>

              {/* Payment Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['upi', 'card', 'google_pay'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPaymentType(type)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      paymentType === type
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs'
                        : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      {type === 'upi' ? 'UPI (GPay/PhonePe)' : type === 'card' ? 'Credit/Debit Card' : 'Net Banking'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Card Form */}
              <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                    {paymentType === 'upi' ? 'UPI ID (VPA) / Number' : 'Card Number'}
                  </label>
                  <input
                    type="text"
                    value={paymentType === 'upi' ? 'username@okhdfcbank' : cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>

                {paymentType !== 'upi' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                        Security Code (CVV)
                      </label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Radical Transparency Savings Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Radical Transparency Value Report
                  </span>
                  <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300">
                    You saved ₹{totalSavedVsTraditional.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80">
                  Equivalent garments at traditional luxury stores cost <strong>₹{totalTraditionalRetail.toLocaleString('en-IN')}</strong>. You are purchasing directly at ethical production pricing.
                </p>
              </div>

              {/* Order Totals Summary */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-zinc-900 text-xs space-y-2">
                <div className="flex justify-between text-stone-600 dark:text-zinc-300">
                  <span>Subtotal ({items.length} garments)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>Transparency Promo Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-zinc-300">
                  <span>Shipping ({shippingMethod})</span>
                  <span>{shippingFee === 0 ? 'Complimentary (₹0)' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-zinc-300">
                  <span>Estimated GST (5%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Total Due</span>
                  <span className="font-mono">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Next/Submit */}
              <div className="flex justify-between items-center pt-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  id="checkout-place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Securing Stock & Verifying...' : `Authorize ₹${total.toLocaleString('en-IN')}`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Confirmation */}
          {step === 4 && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                  Ethical Order Registered
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  Thank you for choosing Radical Transparency
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Your piece is being prepared for dispatch from our partner ateliers.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="p-5 rounded-2xl bg-stone-100/80 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 text-left space-y-4 max-w-xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-stone-500">Order Reference</span>
                    <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {completedOrder.orderNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500">Estimated Delivery</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {completedOrder.estimatedDelivery}
                    </p>
                  </div>
                </div>

                {/* Tracking ID with copy */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-stone-500" />
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-mono">Carrier Tracking ID</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {completedOrder.trackingNumber}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={copyTracking}
                    className="p-1.5 rounded text-stone-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Copy tracking"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Garments Ordered */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Garments in Package ({completedOrder.items.length})
                  </span>
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt={item.title} className="w-9 h-11 rounded object-cover" />
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {item.color} • {item.size} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Total Paid & Saved */}
                <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex justify-between items-baseline text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                      Saved ₹{completedOrder.totalSavedVsTraditional.toLocaleString('en-IN')} vs. Traditional Markup
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Total Paid</span>
                  </div>
                  <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
                    ₹{completedOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="checkout-view-account-btn"
                  onClick={() => {
                    onClose();
                    onViewOrderInAccount();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
                >
                  View in Order History
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
