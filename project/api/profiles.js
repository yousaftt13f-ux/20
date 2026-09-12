import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('followers_count', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'PUT') {
      const { id, full_name, bio, avatar_url, followers_count, following_count, likes_count } = req.body;
      const updates = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (bio !== undefined) updates.bio = bio;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (followers_count !== undefined) updates.followers_count = followers_count;
      if (following_count !== undefined) updates.following_count = following_count;
      if (likes_count !== undefined) updates.likes_count = likes_count;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API profiles error:', err);
    res.status(500).json({ error: err.message });
  }
}
