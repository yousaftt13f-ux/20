import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;

      const { data: profiles } = await supabase.from('profiles').select('*');
      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      const storiesWithUser = (stories || []).map(s => ({
        ...s,
        user: profileMap[s.user_id] || {
          id: s.user_id,
          username: s.user_id,
          full_name: 'مستخدم',
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${s.user_id}`
        }
      }));

      return res.status(200).json(storiesWithUser);
    }

    if (req.method === 'POST') {
      const { user_id, media_url, caption } = req.body;
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user_id || 'usr_ahmed',
          media_url: media_url || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
          caption: caption || ''
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API stories error:', err);
    res.status(500).json({ error: err.message });
  }
}
