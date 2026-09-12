import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      let query = supabase.from('cart').select('*');
      if (user_id) query = query.eq('user_id', user_id);
      const { data: cartItems, error } = await query.order('id', { ascending: true });
      if (error) throw error;

      const { data: products } = await supabase.from('products').select('*');
      const productMap = (products || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      const result = (cartItems || []).map(item => ({
        ...item,
        product: productMap[item.product_id] || null
      })).filter(i => i.product);

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { user_id, product_id, quantity = 1 } = req.body;
      const uid = user_id || 'usr_ahmed';
      const pid = Number(product_id);

      // Check if product already in cart
      const { data: existing } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', uid)
        .eq('product_id', pid)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity: (existing.quantity || 1) + Number(quantity) })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('cart')
          .insert({
            user_id: uid,
            product_id: pid,
            quantity: Number(quantity)
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    if (req.method === 'PUT') {
      const { id, quantity } = req.body;
      if (Number(quantity) <= 0) {
        await supabase.from('cart').delete().eq('id', id);
        return res.status(200).json({ ok: true, deleted: true });
      }
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: Number(quantity) })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id, user_id } = req.body;
      if (id) {
        const { error } = await supabase.from('cart').delete().eq('id', id);
        if (error) throw error;
      } else if (user_id) {
        const { error } = await supabase.from('cart').delete().eq('user_id', user_id);
        if (error) throw error;
      }
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API cart error:', err);
    res.status(500).json({ error: err.message });
  }
}
