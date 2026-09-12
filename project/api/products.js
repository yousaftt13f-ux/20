import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { title, description, price, original_price, image_url, category, rating, badge, stock } = req.body;
      const { data, error } = await supabase
        .from('products')
        .insert({
          title,
          description,
          price: Number(price),
          original_price: Number(original_price || price),
          image_url,
          category: category || 'electronics',
          rating: Number(rating || 5.0),
          sales_count: 0,
          stock: Number(stock || 50),
          badge: badge || 'جديد'
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API products error:', err);
    res.status(500).json({ error: err.message });
  }
}
