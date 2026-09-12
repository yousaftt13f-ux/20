import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { post_id } = req.query;
      let query = supabase.from('comments').select('*');
      if (post_id) {
        query = query.eq('post_id', Number(post_id));
      }
      const { data: comments, error } = await query.order('id', { ascending: true });
      if (error) throw error;

      const { data: profiles } = await supabase.from('profiles').select('*');
      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      const result = (comments || []).map(c => ({
        ...c,
        user: profileMap[c.user_id] || {
          username: c.user_id,
          full_name: 'مستخدم',
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${c.user_id}`
        }
      }));

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { post_id, user_id, content } = req.body;
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          post_id: Number(post_id),
          user_id: user_id || 'usr_ahmed',
          content
        })
        .select()
        .single();
      if (error) throw error;

      // Increment comments_count on post
      const { data: post } = await supabase.from('posts').select('comments_count').eq('id', Number(post_id)).single();
      if (post) {
        await supabase.from('posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', Number(post_id));
      }

      return res.status(201).json(comment);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API comments error:', err);
    res.status(500).json({ error: err.message });
  }
}
