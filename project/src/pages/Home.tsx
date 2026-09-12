import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import { Post, Story, Comment } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Plus,
  Send,
  X,
  Music,
  Download,
  Bell,
  Search,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'foryou' | 'following'>('foryou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(true);

  // Comments drawer
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Share drawer
  const [activeSharePost, setActiveSharePost] = useState<Post | null>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const [postsRes, storiesRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/stories'),
      ]);
      if (postsRes.ok) {
        const p = await postsRes.json();
        setPosts(p);
      }
      if (storiesRes.ok) {
        const s = await storiesRes.json();
        setStories(s);
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = async (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic toggle
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, user_id: currentUser.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.liked) {
          showToast('تم الإعجاب', `أعجبك منشور @${post.user?.username || 'مستخدم'}`);
        }
      }
    } catch {
      // ignore
    }
  };

  const openComments = async (post: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveCommentPost(post);
    try {
      const res = await fetch(`/api/comments?post_id=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    }
  };

  const submitComment = async () => {
    if (!newCommentText.trim() || !activeCommentPost) return;
    const content = newCommentText.trim();
    setNewCommentText('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: activeCommentPost.id,
          user_id: currentUser.id,
          content,
        }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, { ...comment, user: currentUser }]);
        setPosts(prev =>
          prev.map(p =>
            p.id === activeCommentPost.id ? { ...p, comments_count: p.comments_count + 1 } : p
          )
        );
        showToast('تم التعليق', 'تم نشر تعليقك بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden" dir="rtl">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-2 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          {/* Logo 12 */}
          <div
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-rose-500/30 cursor-pointer active:scale-95 transition-transform"
          >
            12
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Feed tabs: لك / أتابعهم */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTab('foryou')}
            className={`text-sm font-bold transition-all relative py-1 ${
              tab === 'foryou' ? 'text-white scale-105' : 'text-white/60 hover:text-white/80'
            }`}
          >
            لك
            {tab === 'foryou' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('following')}
            className={`text-sm font-bold transition-all relative py-1 ${
              tab === 'following' ? 'text-white scale-105' : 'text-white/60 hover:text-white/80'
            }`}
          >
            تتابعهم
            {tab === 'following' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Notifications & APK download badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/download')}
            className="px-2 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-bold flex items-center gap-1 border border-rose-500/30"
            title="تنزيل APK"
          >
            <Download className="w-3 h-3" />
            <span>APK</span>
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
          </button>
        </div>
      </div>

      {/* Stories Carousel (Instagram / TikTok style top bar) */}
      <div className="pt-12 px-3 pb-2 flex items-center gap-3 overflow-x-auto no-scrollbar z-20 bg-gradient-to-b from-black/80 to-transparent">
        {/* Current user add story */}
        <div
          onClick={() => navigate('/create')}
          className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
        >
          <div className="relative">
            <img
              src={currentUser.avatar_url}
              alt="قصتي"
              className="w-13 h-13 rounded-full object-cover ring-2 ring-neutral-700 p-0.5"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-black shadow">
              <Plus className="w-3 h-3" />
            </div>
          </div>
          <span className="text-[10px] text-white/80 font-medium">قصتك</span>
        </div>

        {/* Stories from database */}
        {stories.map(s => (
          <div
            key={s.id}
            onClick={() => navigate(`/story/${s.user_id}`)}
            className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="w-13 h-13 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md">
              <img
                src={s.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${s.user_id}`}
                alt={s.user?.username}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            <span className="text-[10px] text-white/90 font-medium truncate max-w-[55px]">
              {s.user?.full_name?.split(' ')[0] || s.user_id}
            </span>
          </div>
        ))}
      </div>

      {/* Main Full-Height Feed */}
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar relative pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-white/60 gap-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">جاري تحميل خلاصة تطبيق 12...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-white/60 gap-3 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-2xl font-bold">
              12
            </div>
            <p className="text-sm font-bold text-white">لا توجد منشورات حتى الآن</p>
            <p className="text-xs text-white/60">كن أول من ينشر محتوى في تطبيق 12!</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-2 px-5 py-2 rounded-full bg-rose-500 text-white font-bold text-xs"
            >
              إنشاء منشور الآن
            </button>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className="h-[calc(100vh-170px)] sm:h-[720px] w-full snap-start snap-always relative flex items-center justify-center bg-neutral-900 overflow-hidden mb-3 sm:rounded-3xl border border-white/5"
              onDoubleClick={e => handleLike(post, e)}
            >
              {/* Media: Video or Image */}
              {post.media_type === 'video' ? (
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                />
              ) : (
                <img
                  src={post.media_url}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}

              {/* Sound Toggle (Top Left) */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setMuted(prev => !prev);
                }}
                className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/50 text-white backdrop-blur-md"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Action Sidebar (Right side, one-handed reachable) */}
              <div className="absolute right-3 bottom-12 z-20 flex flex-col items-center gap-4">
                {/* Author Avatar with quick follow button */}
                <div
                  onClick={() => navigate(`/user/${post.user?.username || 'user'}`)}
                  className="relative cursor-pointer group"
                >
                  <img
                    src={
                      post.user?.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${post.user_id}`
                    }
                    alt={post.user?.username}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-[10px] ring-2 ring-black">
                    <Plus className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={e => handleLike(post, e)}
                  className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
                >
                  <div
                    className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                      post.is_liked ? 'bg-rose-500/30' : 'bg-black/40'
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        post.is_liked ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-sm">
                    {formatNumber(post.likes_count)}
                  </span>
                </button>

                {/* Comments Button */}
                <button
                  onClick={e => openComments(post, e)}
                  className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-sm">
                    {formatNumber(post.comments_count)}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setActiveSharePost(post);
                  }}
                  className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-sm">
                    {formatNumber(post.shares_count || 12)}
                  </span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => showToast('تم الحفظ', 'تم حفظ المنشور في المفضلة')}
                  className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors">
                    <Bookmark className="w-6 h-6 text-white" />
                  </div>
                </button>

                {/* Vinyl Record Spinning Effect */}
                <div className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center animate-spin [animation-duration:5s] shadow-lg">
                  <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                </div>
              </div>

              {/* Bottom Post Details (Caption, Tags, Music Track) */}
              <div className="absolute bottom-4 left-4 right-16 z-20 text-white text-right">
                <div
                  onClick={() => navigate(`/user/${post.user?.username || 'user'}`)}
                  className="flex items-center gap-2 mb-1.5 cursor-pointer"
                >
                  <span className="font-bold text-sm tracking-wide text-white">
                    @{post.user?.username || 'مستخدم'}
                  </span>
                  {post.user?.is_verified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      showToast('تمت المتابعة', `بدأت بمتابعة @${post.user?.username}`);
                    }}
                    className="text-[10px] bg-rose-500/30 hover:bg-rose-500/50 text-rose-300 px-2 py-0.5 rounded-full font-bold transition-colors"
                  >
                    تابع
                  </button>
                </div>

                <p className="text-[12px] leading-relaxed mb-1.5 line-clamp-2 text-white/95">
                  {post.caption}
                </p>

                {post.tags && (
                  <p className="text-[11px] text-rose-300 mb-1.5">{post.tags}</p>
                )}

                {post.audio_title && (
                  <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                    <Music className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span className="truncate max-w-[200px]">{post.audio_title}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comments Drawer Modal */}
      {activeCommentPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setActiveCommentPost(null)}
        >
          <div
            className="w-full max-w-md mx-auto bg-neutral-900 text-white rounded-t-3xl p-4 max-h-[75vh] flex flex-col shadow-2xl border-t border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm">
                التعليقات ({comments.length})
              </span>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {comments.length === 0 ? (
                <p className="text-center text-white/40 text-xs py-8">
                  لا توجد تعليقات بعد، كن أول من يشارك برأيه!
                </p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5 text-right">
                    <img
                      src={c.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.user_id}`}
                      alt={c.user?.username}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                    />
                    <div className="flex-1 bg-white/5 rounded-2xl px-3 py-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-rose-400">
                          {c.user?.full_name || c.user_id}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {new Date(c.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-white/90">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment input */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <img
                src={currentUser.avatar_url}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="أضف تعليقاً لطيفاً..."
                className="flex-1 bg-white/5 rounded-full px-3 py-2 text-xs outline-none border border-white/10 focus:border-rose-500 text-white placeholder-white/40"
              />
              <button
                onClick={submitComment}
                disabled={!newCommentText.trim()}
                className="p-2 rounded-full bg-rose-500 text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Drawer Modal */}
      {activeSharePost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setActiveSharePost(null)}
        >
          <div
            className="w-full max-w-md mx-auto bg-neutral-900 text-white rounded-t-3xl p-4 shadow-2xl border-t border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="font-bold text-sm">مشاركة المنشور</span>
              <button
                onClick={() => setActiveSharePost(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin);
                  showToast('تم النسخ', 'تم نسخ رابط المنشور إلى الحافظة');
                  setActiveSharePost(null);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
                  🔗
                </div>
                <span className="text-[11px] text-white/80">نسخ الرابط</span>
              </button>

              <button
                onClick={() => {
                  navigate('/messages');
                  setActiveSharePost(null);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
                  ✉️
                </div>
                <span className="text-[11px] text-white/80">إرسال لـ DM</span>
              </button>

              <button
                onClick={() => {
                  showToast('واتساب', 'فتح نافذة المشاركة عبر واتساب');
                  setActiveSharePost(null);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                  💬
                </div>
                <span className="text-[11px] text-white/80">واتساب</span>
              </button>

              <button
                onClick={() => {
                  navigate('/download');
                  setActiveSharePost(null);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
                  ⬇️
                </div>
                <span className="text-[11px] text-white/80">تنزيل APK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
