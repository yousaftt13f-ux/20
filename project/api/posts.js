import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;

      // Fetch profiles to safely attach author info without relying on schema cache
      const { data: profiles } = await supabase.from('profiles').select('*');
      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      const postsWithUser = (posts || []).map(p => ({
        ...p,
        user: profileMap[p.user_id] || {
          id: p.user_id,
          username: 'user_' + p.user_id,
          full_name: 'مستخدم 12',
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${p.user_id}`,
          is_verified: false
        }
      }));

      return res.status(200).json(postsWithUser);
    }

    if (req.method === 'POST') {
      const { user_id, caption, media_url, media_type, audio_title, tags } = req.body;
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user_id || 'usr_ahmed',
          caption: caption || '',
          media_url: media_url || 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
          media_type: media_type || 'image',
          audio_title: audio_title || 'الصوت الأصلي - تطبيق 12',
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          tags: tags || '#تطبيق12 #أندرويد'
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API posts error:', err);
    res.status(500).json({ error: err.message });
  }
}
