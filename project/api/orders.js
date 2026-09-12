import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('orders').select('*');
      if (user_id) query = query.eq('user_id', user_id);
      const { data, error } = await query.order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { user_id, total_amount, items_count, address, payment_method } = req.body;
      const uid = user_id || 'usr_ahmed';

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: uid,
          total_amount: Number(total_amount),
          items_count: Number(items_count || 1),
          status: 'confirmed',
          address: address || 'الرياض، المملكة العربية السعودية',
          payment_method: payment_method || 'بطاقة مدى / Apple Pay'
        })
        .select()
        .single();
      if (error) throw error;

      // Clear user cart
      await supabase.from('cart').delete().eq('user_id', uid);

      // Create notification for confirmed order
      await supabase.from('notifications').insert({
        user_id: uid,
        actor_id: uid,
        type: 'order',
        content: `تم تأكيد طلبك رقم #${order.id} بمبلغ ${order.total_amount} ر.س بنجاح! 📦`,
        read: false
      });

      return res.status(201).json(order);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API orders error:', err);
    res.status(500).json({ error: err.message });
  }
}
