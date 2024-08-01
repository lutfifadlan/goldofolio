import type { NextApiRequest, NextApiResponse } from 'next';

const GUMROAD_API_KEY = process.env.GUMROAD_API_KEY;
const SUBSCRIPTION_PRODUCT_ID = 'finxj';

// Set up a simple in-memory cache with an initial expiry time
const cache = {
  price: null as string | null,
  expiry: 0 as number | null,  // Initialize expiry to 0 or a number that indicates it's not set
};

const checkGumroadSubscriptionPrice = async () => {
  const currentTime = Date.now();

  // Check if the cache is valid, also ensure expiry is not null by checking it's a number
  if (cache.price !== null && cache.expiry !== null && cache.expiry > currentTime) {
    return cache.price;
  }

  const gumroadUrl = `https://api.gumroad.com/v2/products/${SUBSCRIPTION_PRODUCT_ID}`;
  const response = await fetch(gumroadUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GUMROAD_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Gumroad subscription price data');
  }

  const data = await response.json();

  if (data && data.product) {
    // Update cache
    cache.price = data.product.formatted_price;
    // Cache expiry time in milliseconds, e.g., 10 minutes
    cache.expiry = currentTime + 1440 * 60 * 1000;
    return cache.price;
  } else {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const price = await checkGumroadSubscriptionPrice();
      res.status(200).json({ price });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
