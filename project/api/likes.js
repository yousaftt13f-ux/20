import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { post_id, user_id } = req.body;
      const pId = Number(post_id);

      // Check if already liked
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', pId)
        .eq('user_id', user_id)
        .maybeSingle();

      const { data: post } = await supabase.from('posts').select('likes_count').eq('id', pId).single();
      const currentLikes = post?.likes_count || 0;

      if (existing) {
        // Unlike
        await supabase.from('likes').delete().eq('id', existing.id);
        const newCount = Math.max(0, currentLikes - 1);
        await supabase.from('posts').update({ likes_count: newCount }).eq('id', pId);
        return res.status(200).json({ liked: false, likes_count: newCount });
      } else {
        // Like
        await supabase.from('likes').insert({ post_id: pId, user_id });
        const newCount = currentLikes + 1;
        await supabase.from('posts').update({ likes_count: newCount }).eq('id', pId);
        return res.status(200).json({ liked: true, likes_count: newCount });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API likes error:', err);
    res.status(500).json({ error: err.message });
  }
}
