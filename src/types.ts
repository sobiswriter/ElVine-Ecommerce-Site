export interface FactoryInfo {
  id: string;
  name: string;
  location: string;
  country: string;
  countryFlag: string;
  established: string;
  employees: number;
  auditScore: number; // e.g. 98%
  fairWageCertified: boolean;
  certifications: string[];
  description: string;
  image: string;
  workingConditions: {
    livingWage: string;
    renewableEnergy: string;
    femaleLeadership: string;
    wasteRecycled: string;
  };
}

export interface TransparentCostBreakdown {
  materials: number;
  hardware: number;
  labor: number;
  transport: number;
  duties: number;
  totalTrueCost: number;
  traditionalRetailPrice: number;
  elvinePrice: number;
}

export type Department = 'Women' | 'Men' | 'About' | 'Stories';

export type CategoryType = 'Sweaters & Cashmere' | 'Outerwear & Coats' | 'Tees & Tops' | 'Denim & Trousers' | 'Dresses & Jumpsuits' | 'Footwear & Accessories';
export type FabricType = 'Grade-A Cashmere' | 'Organic Pima Cotton' | 'Italian ReWool' | 'Selvedge Denim' | 'Clean Silk' | 'French Linen' | 'Alpaca Blend' | 'Lenzing Tencel';
export type FitType = 'Slim Fit' | 'Relaxed Fit' | 'Oversized' | 'Tailored' | 'Classic Fit';
export type WaistbandType = 'High Rise' | 'Mid Rise' | 'Elastic Comfort' | 'Flat Front' | 'Drawstring';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  colorName?: string;
  department?: 'Women' | 'Men' | 'Unisex';
  price: number;
  originalPrice?: number;
  category: CategoryType;
  fabric: FabricType;
  fit: FitType;
  waistband?: WaistbandType;
  tags: string[];
  sustainabilityBadges?: string[];
  description: string;
  materialDetails: string;
  careInstructions: string;
  features: string[];
  specs: Record<string, string>;
  stock: number;
  rating: number;
  reviewCount: number;
  fitFeedback?: {
    runsSmall: number; // percentage
    trueToSize: number; // percentage
    runsLarge: number; // percentage
  };
  images: string[];
  colors: { name: string; hex: string; class: string }[];
  sizes: string[];
  factory: FactoryInfo;
  transparentCost: TransparentCostBreakdown;
  complementaryProductIds: string[]; // for "Add To Your Forever Wardrobe"
  isFeatured?: boolean;
  isNew?: boolean;
  salesCount: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpfulVotes: number;
  sizePurchased?: string;
  fitRating?: 'Runs Small' | 'True to Size' | 'Runs Large';
  photos?: string[];
  userVotedHelpful?: boolean;
}

export interface CartItem {
  id: string; // unique item id (productId + color + size)
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  category?: string;
}

export interface BrowsingHistoryItem {
  productId: string;
  timestamp: number;
  viewCount: number;
}

export interface AIRecommendation {
  productId: string;
  reason: string;
  matchScore: number;
  contextTag: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  fabric?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  totalSavedVsTraditional: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: {
    type: 'card' | 'apple_pay' | 'google_pay';
    last4?: string;
    brand?: string;
  };
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  memberSince: string;
  tier: 'ElVine Collective' | 'ElVine Archive' | 'ElVine Founder Club';
  preferredSizes: {
    tops: string;
    bottoms: string;
    shoes: string;
  };
  saveInfoForFastCheckout: boolean;
  addresses: {
    id: string;
    isDefault: boolean;
    label: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }[];
  paymentMethods: {
    id: string;
    isDefault: boolean;
    cardholderName: string;
    last4: string;
    expiry: string;
    brand: 'visa' | 'mastercard' | 'amex';
  }[];
}

export type ActiveTab = 'browse' | 'cart' | 'wishlist' | 'transparency' | 'account';
