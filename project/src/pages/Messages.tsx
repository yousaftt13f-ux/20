import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Message, Profile } from '../types';
import { Search, Plus, Phone, Video, CheckCheck } from 'lucide-react';

export const Messages: React.FC = () => {
  const { currentUser, users } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Filter contacts
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="p-3.5 bg-neutral-900/90 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-base text-white">الرسائل المباشرة</h2>
          <p className="text-[11px] text-white/50">تواصل فوري مع أصدقائك</p>
        </div>

        <button
          onClick={() => navigate(`/chat/${otherUsers[0]?.id || 'usr_sara'}`)}
          className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-rose-500 transition-colors">
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في المحادثات..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 outline-none"
          />
        </div>
      </div>

      {/* Online Now Horizontal Carousel */}
      <div className="p-3 border-b border-white/5">
        <h4 className="text-[11px] font-bold text-white/60 mb-2">نشطون الآن في 12</h4>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {otherUsers.map(u => (
            <div
              key={u.id}
              onClick={() => navigate(`/chat/${u.id}`)}
              className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
            >
              <div className="relative">
                <img
                  src={u.avatar_url}
                  alt={u.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50 p-0.5"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-black" />
              </div>
              <span className="text-[10px] text-white/80 font-medium truncate max-w-[50px]">
                {u.full_name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 p-2 space-y-1">
        {otherUsers.map(user => {
          const userMessages = messages.filter(
            m =>
              (m.sender_id === user.id && m.recipient_id === currentUser.id) ||
              (m.sender_id === currentUser.id && m.recipient_id === user.id)
          );
          const lastMsg = userMessages[userMessages.length - 1];

          return (
            <div
              key={user.id}
              onClick={() => navigate(`/chat/${user.id}`)}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/5"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-13 h-13 rounded-full object-cover ring-1 ring-white/10"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-black" />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {user.full_name}
                    {user.is_verified && (
                      <span className="w-3 h-3 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
                        ✓
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-white/40">12:30 م</span>
                </div>

                <p className="text-[11px] text-white/60 truncate">
                  {lastMsg ? (
                    lastMsg.is_voice ? (
                      '🎙️ رسالة صوتية مسجلة'
                    ) : (
                      lastMsg.text
                    )
                  ) : (
                    'أهلاً بك في تطبيق 12! اضغط لبدء المحادثة'
                  )}
                </p>
              </div>

              {/* Call triggers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/video-call/${user.id}`);
                  }}
                  className="p-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="مكالمة فيديو"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
