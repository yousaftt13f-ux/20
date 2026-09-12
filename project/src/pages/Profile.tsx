import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAndroid } from '../contexts/AndroidContext';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import {
  Settings,
  Edit3,
  Bookmark,
  Heart,
  Grid,
  Download,
  Users,
  Check,
  X,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, users, switchUser, updateProfile } = useAuth();
  const { showToast } = useAndroid();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [switchOpen, setSwitchOpen] = useState<boolean>(false);

  // Edit fields
  const [editName, setEditName] = useState<string>(currentUser.full_name);
  const [editBio, setEditBio] = useState<string>(currentUser.bio || '');
  const [editAvatar, setEditAvatar] = useState<string>(currentUser.avatar_url);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const all = await res.json();
          setUserPosts(all.filter((p: Post) => p.user_id === currentUser.id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserPosts();
  }, [currentUser.id]);

  const handleSaveProfile = async () => {
    await updateProfile({
      full_name: editName,
      bio: editBio,
      avatar_url: editAvatar,
    });
    setEditOpen(false);
    showToast('تم الحفظ', 'تم تحديث معلومات ملفك الشخصي');
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
          <h2 className="font-extrabold text-base text-white">@{currentUser.username}</h2>
          {currentUser.is_verified && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Account */}
          <button
            onClick={() => setSwitchOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            title="تبديل الحساب"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Download Center */}
          <button
            onClick={() => navigate('/download')}
            className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
            title="مركز تنزيل التطبيق APK"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* User Info Header */}
        <div className="p-4 flex items-center gap-4 border-b border-white/5">
          <div className="relative">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.username}
              className="w-20 h-20 rounded-full object-cover ring-3 ring-rose-500 p-0.5 shadow-xl shadow-rose-500/20"
            />
          </div>

          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="text-sm font-extrabold text-white">{userPosts.length || 12}</p>
              <p className="text-[10px] text-white/50">منشورات</p>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">
                {formatNumber(currentUser.followers_count)}
              </p>
              <p className="text-[10px] text-white/50">متابعون</p>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">
                {formatNumber(currentUser.following_count)}
              </p>
              <p className="text-[10px] text-white/50">يتابع</p>
            </div>
          </div>
        </div>

        {/* Bio and Edit Action */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-white mb-0.5">{currentUser.full_name}</h3>
          <p className="text-xs text-white/70 leading-relaxed mb-3">
            {currentUser.bio || 'مستخدم مميز في شبكة 12 الاجتماعية'}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditName(currentUser.full_name);
                setEditBio(currentUser.bio || '');
                setEditAvatar(currentUser.avatar_url);
                setEditOpen(true);
              }}
              className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل الملف الشخصي</span>
            </button>

            <button
              onClick={() => navigate('/download')}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1 shadow-lg shadow-rose-500/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل APK</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-t border-b border-white/5 mt-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
              activeTab === 'posts' ? 'border-rose-500 text-rose-400' : 'border-transparent text-white/40'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
              activeTab === 'saved' ? 'border-rose-500 text-rose-400' : 'border-transparent text-white/40'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
              activeTab === 'liked' ? 'border-rose-500 text-rose-400' : 'border-transparent text-white/40'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Posts Media Grid */}
        <div className="grid grid-cols-3 gap-1 p-1">
          {userPosts.map(post => (
            <div
              key={post.id}
              onClick={() => navigate('/')}
              className="aspect-square bg-neutral-900 overflow-hidden rounded-lg cursor-pointer group relative"
            >
              {post.media_type === 'video' ? (
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  muted
                />
              ) : (
                <img
                  src={post.media_url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-neutral-900 text-white rounded-t-3xl p-4 border-t border-white/10 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm">تعديل الملف الشخصي</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-white/50 block mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/50 block mb-1">نبذة عنك (Bio)</label>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 text-xs text-white outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/50 block mb-1">رابط الصورة الشخصية</label>
              <input
                type="text"
                value={editAvatar}
                onChange={e => setEditAvatar(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 text-xs text-white/70 outline-none"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
            >
              حفظ التعديلات
            </button>
          </div>
        </div>
      )}

      {/* Switch Account Modal */}
      {switchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
          onClick={() => setSwitchOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-neutral-900 text-white rounded-t-3xl p-4 border-t border-white/10 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm">تبديل الحساب التجريبي</h3>
              <button onClick={() => setSwitchOpen(false)} className="p-1 text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    switchUser(u);
                    setSwitchOpen(false);
                    showToast('تم التبديل', `أهلاً بك @${u.username}`);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                    u.id === currentUser.id
                      ? 'bg-rose-500/20 border border-rose-500/40'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.full_name}</h4>
                      <p className="text-[10px] text-white/50">@{u.username}</p>
                    </div>
                  </div>

                  {u.id === currentUser.id && (
                    <Check className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
