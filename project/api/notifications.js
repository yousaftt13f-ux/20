import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;

      const { data: profiles } = await supabase.from('profiles').select('*');
      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      const result = (notifications || []).map(n => ({
        ...n,
        actor: profileMap[n.actor_id] || {
          username: n.actor_id,
          full_name: 'مستخدم 12',
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${n.actor_id}`
        }
      }));

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { user_id, actor_id, type, content } = req.body;
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user_id || 'usr_ahmed',
          actor_id: actor_id || 'usr_sara',
          type: type || 'like',
          content: content || '',
          read: false
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id } = req.body;
      let query = supabase.from('notifications').update({ read: true });
      if (id) {
        query = query.eq('id', id);
      } else {
        query = query.neq('id', 0); // mark all as read
      }
      const { error } = await query;
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API notifications error:', err);
    res.status(500).json({ error: err.message });
  }
}
