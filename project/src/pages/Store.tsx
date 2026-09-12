import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import {
  ShoppingBag,
  Star,
  Search,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'الكل' },
  { id: 'electronics', name: 'هواتف وأجهزة' },
  { id: 'accessories', name: 'إكسسوارات' },
  { id: 'fashion', name: 'ملابس وهوية' },
  { id: 'digital', name: 'اشتراكات VIP' },
];

export const Store: React.FC = () => {
  const { currentUser } = useAuth();
  const { cartCount, refreshCartCount, showToast } = useAndroid();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = async (product: Product) => {
    setAddingId(product.id);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          product_id: product.id,
          quantity: 1,
        }),
      });
      if (res.ok) {
        refreshCartCount();
        showToast('تمت الإضافة للسلة 🛍️', `تمت إضافة "${product.title.slice(0, 24)}..." بنجاح`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAddingId(null), 800);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Top Header */}
      <div className="p-3.5 bg-neutral-900/90 border-b border-white/5 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h2 className="font-extrabold text-base text-white flex items-center gap-1.5">
            <span>متجر 12 الذكي</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">
              رسمي
            </span>
          </h2>
          <p className="text-[10px] text-white/50">أفضل منتجات أندرويد وإكسسوارات المحتوى</p>
        </div>

        {/* Cart Icon with badge */}
        <button
          onClick={() => navigate('/cart')}
          className="relative p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-rose-400" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-500/40">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-rose-500 transition-colors">
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في المتجر..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2.5">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Banner: Store Perks */}
      <div className="mx-3 my-2 p-2.5 rounded-2xl bg-gradient-to-r from-rose-900/40 via-red-900/20 to-neutral-900 border border-rose-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-rose-400" />
          <span className="font-bold text-white text-[11px]">شحن سريع مجاني لجميع الطلبات فوق 200 ر.س</span>
        </div>
        <span className="text-[10px] text-rose-400 font-bold">كود: ANDROID12</span>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 p-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-white/40 text-xs py-10">لا توجد منتجات مطابقة في هذا القسم</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(p => {
              const isAdding = addingId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-neutral-900 rounded-3xl p-3 border border-white/5 hover:border-white/10 flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Image & Badge */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-800 mb-2">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {p.badge && (
                        <span className="absolute top-2 right-2 bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-bold">{p.rating}</span>
                      <span className="text-white/40">({p.sales_count})</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight mb-1">
                      {p.title}
                    </h3>

                    {/* Description snippet */}
                    <p className="text-[10px] text-white/50 line-clamp-1 mb-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-0.5">
                        <span>{p.price}</span>
                        <span className="text-[9px] text-rose-400 font-bold">ر.س</span>
                      </div>
                      {p.original_price > p.price && (
                        <span className="text-[9px] text-white/40 line-through">
                          {p.original_price} ر.س
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={isAdding}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                        isAdding
                          ? 'bg-emerald-500 text-white scale-110'
                          : 'bg-rose-500 hover:bg-rose-600 text-white active:scale-95 shadow-md shadow-rose-500/30'
                      }`}
                      title="إضافة للسلة"
                    >
                      {isAdding ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
