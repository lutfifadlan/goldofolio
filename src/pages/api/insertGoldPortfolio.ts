import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount, dateOfPurchase, purchasePrice, userId } = req.body;
    
    const { data, error } = await supabase
        .from('gold_portfolio')
        .insert([
          {
            user_id: userId,
            gold_weight: parseFloat(amount),
            gold_buying_date: dateOfPurchase,
            gold_buying_price: parseFloat(purchasePrice) 
          }
        ]);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json(data);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
