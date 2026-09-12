import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { sender_id, recipient_id, text, media_url, is_voice, voice_duration } = req.body;
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: 1,
          sender_id: sender_id || 'usr_ahmed',
          recipient_id: recipient_id || 'usr_sara',
          text: text || '',
          media_url: media_url || null,
          is_voice: Boolean(is_voice),
          voice_duration: voice_duration ? Number(voice_duration) : 0
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API messages error:', err);
    res.status(500).json({ error: err.message });
  }
}
