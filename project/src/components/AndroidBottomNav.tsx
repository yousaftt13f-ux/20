import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, ShoppingBag, User } from 'lucide-react';
import { useAndroid } from '../contexts/AndroidContext';

export const AndroidBottomNav: React.FC = () => {
  const { cartCount, unreadMessagesCount } = useAndroid();

  return (
    <nav className="h-16 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 px-2 flex items-center justify-around z-40 relative">
      {/* 1. Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
            isActive ? 'text-rose-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">الرئيسية</span>
      </NavLink>

      {/* 2. Explore / Search */}
      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
            isActive ? 'text-rose-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">استكشاف</span>
      </NavLink>

      {/* 3. Create (Camera / Video Studio) - Highlighted center button */}
      <NavLink
        to="/create"
        className="relative -top-3 group flex flex-col items-center active:scale-95 transition-transform"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-red-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/40 ring-4 ring-neutral-950 group-hover:scale-105 transition-transform">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[9px] text-rose-400 font-bold mt-0.5">إنشاء</span>
      </NavLink>

      {/* 4. Store / المتجر */}
      <NavLink
        to="/store"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
            isActive ? 'text-rose-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-neutral-950">
            {cartCount}
          </span>
        )}
        <span className="text-[10px]">المتجر</span>
      </NavLink>

      {/* 5. Profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
            isActive ? 'text-rose-500 font-bold' : 'text-neutral-400 hover:text-white'
          }`
        }
      >
        <User className="w-5 h-5" />
        {unreadMessagesCount > 0 && (
          <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-neutral-950" />
        )}
        <span className="text-[10px]">الملف</span>
      </NavLink>
    </nav>
  );
};

export default AndroidBottomNav;
