import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Story } from '../types';
import { X, Heart, Send, Pause, Play } from 'lucide-react';

export const StoryViewer: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users } = useAuth();
  const navigate = useNavigate();

  const author = users.find(u => u.id === userId) || users[1];

  const [progress, setProgress] = useState<number>(0);
  const [paused, setPaused] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          navigate('/');
          return 100;
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, navigate]);

  return (
    <div
      className="fixed inset-0 z-[150] bg-black text-white flex flex-col justify-between select-none"
      dir="rtl"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Background Story Media */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80"
          alt="story"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Top Header: Progress bar & User info */}
      <div className="z-10 pt-4 px-3 space-y-2">
        {/* Progress Bar (5 seconds total) */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* User info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={author.avatar_url}
              alt={author.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500"
            />
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                {author.full_name}
                <span className="text-[10px] text-white/50">منذ ساعتين</span>
              </h4>
              <p className="text-[10px] text-white/70">@{author.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                setPaused(prev => !prev);
              }}
              className="p-1.5 rounded-full bg-black/40 text-white"
            >
              {paused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                navigate('/');
              }}
              className="p-1.5 rounded-full bg-black/40 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Reply Bar */}
      <div className="z-10 p-4 flex items-center gap-2">
        <input
          type="text"
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="أرسل رداً على القصة..."
          className="flex-1 bg-black/40 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/50 outline-none backdrop-blur-md"
          onClick={e => e.stopPropagation()}
        />

        <button
          onClick={e => {
            e.stopPropagation();
            setLiked(prev => !prev);
          }}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white transition-transform active:scale-125"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            setReplyText('');
          }}
          className="p-2.5 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;
