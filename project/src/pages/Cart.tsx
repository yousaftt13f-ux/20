import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { currentUser } = useAuth();
  const { refreshCartCount, showToast } = useAndroid();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [promoCode, setPromoCode] = useState<string>('ANDROID12');
  const [discountApplied, setDiscountApplied] = useState<boolean>(true);
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cart?user_id=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser.id]);

  const updateQuantity = async (itemId: number, newQty: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, quantity: newQty }),
      });
      if (res.ok) {
        fetchCart();
        refreshCartCount();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      });
      if (res.ok) {
        fetchCart();
        refreshCartCount();
        showToast('تم الحذف', 'تمت إزالة المنتج من السلة');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );
  const discount = discountApplied ? Math.round(subtotal * 0.15) : 0;
  const delivery = subtotal > 200 || subtotal === 0 ? 0 : 25;
  const total = Math.max(0, subtotal - discount + delivery);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setCheckingOut(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          total_amount: total,
          items_count: cartItems.length,
          address: 'الرياض، حي النخيل، المملكة العربية السعودية',
          payment_method: 'Apple Pay / مدى',
        }),
      });

      if (res.ok) {
        refreshCartCount();
        setOrderSuccess(true);
        showToast('تم تأكيد الطلب بنجاح! 📦', `المجموع: ${total} ر.س - الشحن قيد التجهيز`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Top Header */}
      <div className="p-3.5 bg-neutral-900 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/store')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-base text-white">سلة التسوق</h2>
        </div>
        <span className="text-xs text-white/50">{cartItems.length} منتجات</span>
      </div>

      {orderSuccess ? (
        /* Order Confirmed Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">تم تأكيد طلبك بنجاح!</h3>
          <p className="text-xs text-white/60 mb-4 max-w-xs leading-relaxed">
            شكراً لطلبك من متجر 12. ستصلك رسالة وإشعار بحالة الشحن والتوصيل خلال وقت قصير.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
            >
              عرض الإشعارات
            </button>
            <button
              onClick={() => navigate('/store')}
              className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg shadow-rose-500/30"
            >
              متابعة التسوق
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="w-12 h-12 text-white/20 mb-2" />
                <p className="text-xs font-bold text-white/60 mb-3">سلة التسوق فارغة حالياً</p>
                <button
                  onClick={() => navigate('/store')}
                  className="px-5 py-2 rounded-2xl bg-rose-500 text-white text-xs font-bold"
                >
                  تصفح المتجر الآن
                </button>
              </div>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-neutral-900 rounded-2xl p-3 border border-white/5 flex items-center gap-3"
                >
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.title}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-800 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {item.product?.title}
                    </h4>
                    <p className="text-xs font-extrabold text-rose-400 mb-2">
                      {item.product?.price} ر.س
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2 py-1 border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-white/60 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-white/60 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Bottom Sheet */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-neutral-900 border-t border-white/10 space-y-3 pb-20">
              {/* Promo code */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 px-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="رمز الخصم..."
                  className="flex-1 bg-transparent text-xs text-white uppercase outline-none"
                />
                <button
                  onClick={() => {
                    setDiscountApplied(true);
                    showToast('كود الخصم', 'تم تطبيق خصم 15% بنجاح!');
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold"
                >
                  تطبيق
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-white">{subtotal} ر.س</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>خصم الكود (15%)</span>
                    <span>-{discount} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الشحن والتوصيل</span>
                  <span className="text-white font-bold">
                    {delivery === 0 ? 'مجاني 🎉' : `${delivery} ر.س`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                  <span>المجموع الكلي</span>
                  <span className="text-rose-400">{total} ر.س</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition-transform active:scale-95 disabled:opacity-50"
              >
                <span>{checkingOut ? 'جاري تأكيد الطلب...' : 'إتمام الطلب الآن'}</span>
                <span className="font-extrabold">({total} ر.س)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
