import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';

interface AuthContextType {
  currentUser: Profile;
  users: Profile[];
  switchUser: (user: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  loading: boolean;
}

const DEFAULT_USERS: Profile[] = [
  {
    id: 'usr_ahmed',
    username: 'ahmed_12',
    full_name: 'أحمد المنصور',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'مطور ومصمم واجهات أندرويد 📱 مهتم بالتقنية وتطبيقات المستقبل ✨',
    followers_count: 2450,
    following_count: 420,
    likes_count: 18900,
    is_verified: true,
  },
  {
    id: 'usr_sara',
    username: 'sara_design',
    full_name: 'سارة الشمري',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'مصممة واجهات ومتحمسة لتطبيقات الهاتف والذكاء الاصطناعي 🎨✨',
    followers_count: 15300,
    following_count: 210,
    likes_count: 84200,
    is_verified: true,
  },
  {
    id: 'usr_khalid',
    username: 'khalid_tech',
    full_name: 'خالد التميمي',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'مختص في هواتف أندرويد والتطبيقات السحابية ⚡ تقنية بلا حدود',
    followers_count: 48200,
    following_count: 95,
    likes_count: 230000,
    is_verified: true,
  },
  {
    id: 'usr_noura',
    username: 'noura_creator',
    full_name: 'نورة العتيبي',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'صانعة محتوى فيديو وقصص ملهمة 📸 تابعوا يومياتي وتجاربي',
    followers_count: 8900,
    following_count: 340,
    likes_count: 67400,
    is_verified: false,
  },
  {
    id: 'usr_faisal',
    username: 'faisal_photo',
    full_name: 'فيصل الغامدي',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'مصور فوتوغرافي ومخرج أفلام قصيرة بالهاتف المحمول 🎬',
    followers_count: 12100,
    following_count: 180,
    likes_count: 94000,
    is_verified: true,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Profile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<Profile>(DEFAULT_USERS[0]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/profiles');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            const savedId = localStorage.getItem('app12_user_id');
            const match = data.find(u => u.id === savedId) || data[0];
            setCurrentUser(match);
          }
        }
      } catch {
        // fallback to default
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const switchUser = (user: Profile) => {
    setCurrentUser(user);
    localStorage.setItem('app12_user_id', user.id);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const res = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentUser.id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      }
    } catch {
      // optimistic
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, switchUser, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
