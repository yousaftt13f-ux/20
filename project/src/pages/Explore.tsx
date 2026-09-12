import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import { Post, Profile } from '../types';
import { Search, Flame, UserCheck, UserPlus, Play, X } from 'lucide-react';

const CATEGORIES = ['الكل', 'مؤثرون', 'تقنية', 'تصميم', 'تصوير', 'موسيقى', 'طبخ', 'سفر', 'رياضة'];

const TRENDING_TAGS = [
  { tag: '#تطبيق_12', count: '142K' },
  { tag: '#أندرويد12', count: '98K' },
  { tag: '#تقنية_اليوم', count: '76K' },
  { tag: '#صناع_المحتوى', count: '54K' },
  { tag: '#تصوير_الهاتف', count: '39K' },
  { tag: '#متجر_12', count: '28K' },
];

export const Explore: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [creators, setCreators] = useState<Profile[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsRes, profilesRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/profiles'),
        ]);
        if (postsRes.ok) setPosts(await postsRes.json());
        if (profilesRes.ok) setCreators(await profilesRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFollow = (creatorId: string, name: string) => {
    setFollowedIds(prev => {
      const isFollowing = prev.includes(creatorId);
      if (isFollowing) {
        showToast('إلغاء المتابعة', `ألغيت متابعة ${name}`);
        return prev.filter(id => id !== creatorId);
      } else {
        showToast('تمت المتابعة', `أصبحت تتابع ${name} الآن`);
        return [...prev, creatorId];
      }
    });
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.caption.toLowerCase().includes(q) ||
      (post.tags && post.tags.toLowerCase().includes(q)) ||
      (post.user?.full_name && post.user.full_name.toLowerCase().includes(q)) ||
      (post.user?.username && post.user.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden" dir="rtl">
      {/* Search Bar Header */}
      <div className="p-3 bg-neutral-900/90 border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-rose-500 transition-colors">
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أشخاص، هاشتاجات، أو مقاطع فيديو..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* Recommended Creators */}
        {creators.length > 0 && (
          <div className="p-3 border-b border-white/5">
            <h3 className="text-xs font-bold text-white/90 mb-2 flex items-center justify-between">
              <span>مبدعون مقترحون لك</span>
              <span className="text-[10px] text-rose-400 cursor-pointer">عرض المزيد</span>
            </h3>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {creators
                .filter(c => c.id !== currentUser.id)
                .map(creator => {
                  const isFollowing = followedIds.includes(creator.id);
                  return (
                    <div
                      key={creator.id}
                      className="w-24 bg-white/5 rounded-2xl p-2 flex flex-col items-center gap-1.5 flex-shrink-0 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div
                        onClick={() => navigate(`/user/${creator.username}`)}
                        className="relative cursor-pointer"
                      >
                        <img
                          src={creator.avatar_url}
                          alt={creator.username}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/40 p-0.5"
                        />
                        {creator.is_verified && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold ring-1 ring-black">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="text-center w-full">
                        <p className="text-[11px] font-bold text-white truncate">
                          {creator.full_name}
                        </p>
                        <p className="text-[9px] text-white/50 truncate">
                          @{creator.username}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleFollow(creator.id, creator.full_name)}
                        className={`w-full py-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          isFollowing
                            ? 'bg-white/10 text-white/80'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>تتابعه</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>تابع</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Trending Hashtags */}
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-white">المواضيع الأكثر رواجاً في 12</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TRENDING_TAGS.map(t => (
              <div
                key={t.tag}
                onClick={() => setSearchQuery(t.tag)}
                className="bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{t.tag}</p>
                  <p className="text-[10px] text-white/40">{t.count} منشور</p>
                </div>
                <span className="text-rose-400 font-bold text-sm">#</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Media Grid (Instagram / TikTok explore style) */}
        <div className="p-3">
          <h3 className="text-xs font-bold text-white/90 mb-2.5">استكشف المحتوى المميز</h3>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-white/40 text-xs py-10">لا توجد نتائج مطابقة لبحثك</p>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate('/')}
                  className="relative aspect-[3/4] bg-neutral-900 rounded-lg overflow-hidden cursor-pointer group"
                >
                  {post.media_type === 'video' ? (
                    <>
                      <video
                        src={post.media_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        muted
                        loop
                      />
                      <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded-md p-1 text-white">
                        <Play className="w-2.5 h-2.5 fill-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={post.media_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}

                  {/* Likes overlay on hover / touch */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-[10px] text-white">
                    <span>❤️ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
