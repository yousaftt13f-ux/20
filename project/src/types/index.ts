export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  likes_count: number;
  is_verified?: boolean;
  created_at?: string;
}

export interface Post {
  id: number;
  user_id: string;
  caption: string;
  media_url: string;
  media_type: 'image' | 'video';
  audio_title?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  tags?: string;
  created_at: string;
  user?: Profile;
  is_liked?: boolean;
}

export interface Story {
  id: number;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  recipient_id: string;
  text: string;
  media_url?: string;
  is_voice?: boolean;
  voice_duration?: number;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'order' | 'call';
  content: string;
  read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  original_price: number;
  image_url: string;
  category: 'electronics' | 'accessories' | 'fashion' | 'digital';
  rating: number;
  sales_count: number;
  stock: number;
  badge?: string;
  created_at?: string;
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: string;
  total_amount: number;
  items_count: number;
  status: string;
  address: string;
  payment_method: string;
  created_at: string;
}
