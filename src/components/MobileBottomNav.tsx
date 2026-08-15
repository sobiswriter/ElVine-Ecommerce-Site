import React from 'react';
import { Compass, ShoppingBag, Heart, User, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenConcierge: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  onOpenConcierge,
}) => {
  const tabs = [
    {
      id: 'browse' as ActiveTab,
      label: 'Explore',
      icon: Compass,
      onClick: () => setActiveTab('browse'),
    },
    {
      id: 'wishlist' as ActiveTab,
      label: 'Saved',
      icon: Heart,
      badge: wishlistCount,
      onClick: () => setActiveTab('wishlist'),
    },
    {
      id: 'ai-stylist' as ActiveTab,
      label: 'AI Stylist',
      icon: Sparkles,
      onClick: onOpenConcierge,
      highlight: true,
    },
    {
      id: 'cart' as ActiveTab,
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount,
      onClick: () => setActiveTab('cart'),
    },
    {
      id: 'account' as ActiveTab,
      label: 'Account',
      icon: User,
      onClick: () => setActiveTab('account'),
    },
  ];

  return (
    <div
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 pb-safe"
    >
      <nav className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.label}
              id={`mobile-tab-${tab.id}`}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : tab.highlight
                  ? 'text-amber-500'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    tab.highlight ? 'text-amber-500' : ''
                  } ${isActive ? 'stroke-[2.5px]' : 'stroke-2'} ${
                    tab.id === 'wishlist' && wishlistCount > 0 && isActive
                      ? 'fill-rose-500 text-rose-500'
                      : ''
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
