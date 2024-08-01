import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { priceDate } = req.query;

  if (req.method === 'GET') {
    try {
      const goldBuyingPrice = await getGoldPricingByPriceDate(priceDate as string);
      if (!goldBuyingPrice) {
        res.status(404).json({ error: 'Gold buying price is not found' });
        return;
      }
      res.status(200).json({ goldBuyingPrice });
    } catch (error) {
      console.error('GET API Route Error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const getGoldPricingByPriceDate = async (priceDate: string) => {
  try {
    const { data, error } = await supabase
      .from('gold_price')
      .select('*')
      .eq('price_date', getFormattedDate(new Date(priceDate)))
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return data[0].gold_buying_price;  
  } catch (error) {
    console.error('Failed to fetch gold pricing', error);
    throw error;
  }
};

// Function to format the date in YYYY-MM-DD
const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-indexed, add 1 to get correct month
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  