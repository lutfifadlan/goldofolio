import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "@/utils/supabaseClient"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, gold_weight, gold_buying_date, gold_buying_price } = req.body;

    if (!id || !gold_weight || !gold_buying_date || !gold_buying_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('gold_portfolio') // Your table name here
      .update({ gold_weight, gold_buying_date, gold_buying_price, updated_at: new Date() })
      .match({ id });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
