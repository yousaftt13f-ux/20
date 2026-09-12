import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../types';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Package,
  PhoneCall,
  CheckCheck,
  Bell,
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const { currentUser } = useAuth();
  const { setUnreadNotificationsCount, showToast } = useAndroid();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments' | 'follows' | 'orders'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
      showToast('الإشعارات', 'تم تعيين جميع الإشعارات كمقروءة');
    } catch {
      // ignore
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'comments') return n.type === 'comment';
    if (filter === 'follows') return n.type === 'follow';
    if (filter === 'orders') return n.type === 'order';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'order':
        return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Top Header */}
      <div className="p-3.5 bg-neutral-900 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-base text-white">مركز الإشعارات</h2>
          <p className="text-[10px] text-white/50">تحديثات حسابك في تطبيق 12</p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>تحديد الكل كمقروء</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar p-3 border-b border-white/5">
        {[
          { id: 'all', name: 'الكل' },
          { id: 'likes', name: 'الإعجابات' },
          { id: 'comments', name: 'التعليقات' },
          { id: 'follows', name: 'المتابعون' },
          { id: 'orders', name: 'الطلبات' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === t.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-white/40">
            <Bell className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-xs font-bold">لا توجد إشعارات جديدة في هذا التصنيف</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'call') navigate(`/video-call/${item.actor_id}`);
                else if (item.type === 'order') navigate('/cart');
                else navigate('/');
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer border ${
                item.read
                  ? 'bg-neutral-900/40 border-transparent hover:border-white/5'
                  : 'bg-rose-500/10 border-rose-500/20'
              }`}
            >
              {/* Actor avatar with action badge */}
              <div className="relative flex-shrink-0">
                <img
                  src={
                    item.actor?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${item.actor_id}`
                  }
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center border border-white/10 shadow">
                  {getIcon(item.type)}
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white leading-relaxed">
                  <span className="font-bold text-rose-400">
                    {item.actor?.full_name || item.actor_id}{' '}
                  </span>
                  <span>{item.content}</span>
                </p>
                <span className="text-[10px] text-white/40 block mt-0.5">
                  {new Date(item.created_at).toLocaleTimeString('ar', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {!item.read && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
