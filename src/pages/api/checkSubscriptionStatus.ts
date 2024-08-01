import type { NextApiRequest, NextApiResponse } from 'next';
import { GumroadSubscription } from "@/interfaces"

type Data = {
  isActive: boolean;
  message?: string;
}

interface GumroadResponse {
  success: boolean;
  sales: GumroadSubscription[];
}

// Replace 'YOUR_GUMROAD_API_KEY' and 'YOUR_SUBSCRIPTION_PRODUCT_ID' with your actual Gumroad API key and product ID.
const GUMROAD_API_KEY = process.env.GUMROAD_API_KEY;
const SUBSCRIPTION_PRODUCT_ID = 'finxj';

async function checkGumroadSubscription(email: string): Promise<boolean> {
  const gumroadUrl = `https://api.gumroad.com/v2/sales?access_token=${GUMROAD_API_KEY}&email=${encodeURIComponent(email)}`;
  const response = await fetch(gumroadUrl, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data from Gumroad');
  }

  const data: GumroadResponse = await response.json();

  if (data.success && data.sales.length > 0) {
    const activeSubscription = data.sales.some(sale => sale.product_permalink === SUBSCRIPTION_PRODUCT_ID
      && sale.paid
      && sale.is_recurring_billing
      && !sale.cancelled
      && !sale.dead
    );
    return activeSubscription;
  }

  return false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ isActive: false, message: 'Email is required' });
      }
      const isActive = await checkGumroadSubscription(email as string);
      res.status(200).json({ isActive });
    } catch (error: any) {
      res.status(500).json({ isActive: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ isActive: false, message: 'Method Not Allowed' });
  }
}
