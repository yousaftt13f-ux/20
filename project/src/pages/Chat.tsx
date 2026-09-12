import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { Message, Profile } from '../types';
import {
  ArrowRight,
  Phone,
  Video,
  Mic,
  Send,
  Image as ImageIcon,
  CheckCheck,
  Play,
  Pause,
} from 'lucide-react';

export const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, users } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const otherUser = users.find(u => u.id === id) || {
    id: id || 'usr_sara',
    username: 'sara_design',
    full_name: 'سارة الشمري',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    followers_count: 15300,
    following_count: 210,
    likes_count: 84200,
    is_verified: true,
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const all = await res.json();
        const chatMsgs = (all || []).filter(
          (m: Message) =>
            (m.sender_id === currentUser.id && m.recipient_id === otherUser.id) ||
            (m.sender_id === otherUser.id && m.recipient_id === currentUser.id)
        );
        setMessages(chatMsgs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (isVoice: boolean = false) => {
    if (!isVoice && !inputText.trim()) return;

    const text = isVoice
      ? 'رسالة صوتية سريعة حول تحديث المتجر ومكالمات الفيديو (0:12) 🎙️'
      : inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          recipient_id: otherUser.id,
          text,
          is_voice: isVoice,
          voice_duration: isVoice ? 12 : 0,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => [...prev, saved]);
        if (isVoice) {
          showToast('تم الإرسال', 'تم إرسال الرسالة الصوتية');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVoicePlay = (msgId: number) => {
    setPlayingVoiceId(prev => (prev === msgId ? null : msgId));
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Top Chat Bar */}
      <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/messages')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate(`/user/${otherUser.username}`)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative">
              <img
                src={otherUser.avatar_url}
                alt={otherUser.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-black" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                {otherUser.full_name}
                {otherUser.is_verified && (
                  <span className="w-3 h-3 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
                    ✓
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-emerald-400">متصل الآن عبر أندرويد</p>
            </div>
          </div>
        </div>

        {/* Audio & Video Call Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              showToast('مكالمة صوتية', `جاري الاتصال بـ ${otherUser.full_name}...`);
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={() => navigate(`/video-call/${otherUser.id}`)}
            className="p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
            title="بدء مكالمة فيديو"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUser.id;
          const isPlaying = playingVoiceId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-1.5 ${isMe ? 'justify-start' : 'justify-end'}`}
            >
              {isMe && (
                <img
                  src={currentUser.avatar_url}
                  className="w-6 h-6 rounded-full object-cover mb-1"
                  alt=""
                />
              )}

              <div
                className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white rounded-br-xs shadow-md shadow-rose-500/20'
                    : 'bg-white/10 text-white rounded-bl-xs border border-white/5'
                }`}
              >
                {/* Voice Note View */}
                {msg.is_voice ? (
                  <div className="flex items-center gap-2.5 py-1">
                    <button
                      onClick={() => toggleVoicePlay(msg.id)}
                      className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </button>

                    {/* Waveform graphic */}
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[14, 22, 10, 26, 18, 28, 12, 24, 20, 16, 26, 12].map((height, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all ${
                            isPlaying ? 'bg-white animate-pulse' : 'bg-white/60'
                          }`}
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-white/80">
                      0:{msg.voice_duration ? msg.voice_duration.toString().padStart(2, '0') : '12'}
                    </span>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/60">
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString('ar', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
                </div>
              </div>

              {!isMe && (
                <img
                  src={otherUser.avatar_url}
                  className="w-6 h-6 rounded-full object-cover mb-1"
                  alt=""
                />
              )}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-neutral-900 border-t border-white/10 flex items-center gap-2">
        <button
          onClick={() => showToast('الصور', 'اختر صورة من المعرض لإرسالها')}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage(false)}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-rose-500"
        />

        {inputText.trim() ? (
          <button
            onClick={() => handleSendMessage(false)}
            className="p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handleSendMessage(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-colors"
            title="إرسال رسالة صوتية"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Chat;
