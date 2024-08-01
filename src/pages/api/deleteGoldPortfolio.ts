import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "@/utils/supabaseClient"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing portfolio ID' });

    const { data, error } = await supabase
      .from('gold_portfolio') // Your table name here
      .delete()
      .match({ id });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
