import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { Post, Profile } from '../types';
import {
  ArrowRight,
  UserPlus,
  UserCheck,
  MessageSquare,
  Video,
  Grid,
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { users } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const user = users.find(u => u.username === username) || {
    id: 'usr_sara',
    username: username || 'user',
    full_name: 'سارة الشمري',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'مصممة واجهات ومتحمسة لتطبيقات الهاتف والذكاء الاصطناعي 🎨✨',
    followers_count: 15300,
    following_count: 210,
    likes_count: 84200,
    is_verified: true,
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const all = await res.json();
          setPosts(all.filter((p: Post) => p.user_id === user.id || p.user?.username === username));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, [user.id, username]);

  const toggleFollow = () => {
    setFollowing(prev => {
      const next = !prev;
      showToast(next ? 'تمت المتابعة' : 'إلغاء المتابعة', `@${user.username}`);
      return next;
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Top Header */}
      <div className="p-3.5 bg-neutral-900 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-base text-white">@{user.username}</h2>
          {user.is_verified && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* User Stats */}
        <div className="p-4 flex items-center gap-4 border-b border-white/5">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover ring-3 ring-rose-500 p-0.5"
          />

          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="text-sm font-extrabold text-white">{posts.length || 8}</p>
              <p className="text-[10px] text-white/50">منشورات</p>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">
                {formatNumber(user.followers_count + (following ? 1 : 0))}
              </p>
              <p className="text-[10px] text-white/50">متابعون</p>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">
                {formatNumber(user.following_count)}
              </p>
              <p className="text-[10px] text-white/50">يتابع</p>
            </div>
          </div>
        </div>

        {/* Bio & Actions */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-white mb-0.5">{user.full_name}</h3>
          <p className="text-xs text-white/70 leading-relaxed mb-3">{user.bio}</p>

          <div className="flex gap-2">
            <button
              onClick={toggleFollow}
              className={`flex-1 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                following
                  ? 'bg-white/10 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30'
              }`}
            >
              {following ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>تتابعه</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>متابعة</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate(`/chat/${user.id}`)}
              className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>مراسلة</span>
            </button>

            <button
              onClick={() => navigate(`/video-call/${user.id}`)}
              className="p-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-2xl transition-colors"
              title="مكالمة فيديو"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-1">
          <div className="grid grid-cols-3 gap-1">
            {posts.map(p => (
              <div
                key={p.id}
                onClick={() => navigate('/')}
                className="aspect-square bg-neutral-900 overflow-hidden rounded-lg cursor-pointer group"
              >
                {p.media_type === 'video' ? (
                  <video
                    src={p.media_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    muted
                  />
                ) : (
                  <img
                    src={p.media_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
