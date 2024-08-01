import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { price } = req.query;

    if (!price) {
      return res.status(400).json({ error: 'Price query parameter is required' });
    }

    const rateResponse = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`);

    if (!rateResponse.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const rateData = await rateResponse.json();

    if (rateData && rateData.result && rateData.result === 'success') {
      const conversionRate = rateData.conversion_rates['IDR'];
      const priceNumber = parseInt((price as string).replace(/\D/g, ''));
      const IDRPrice = Math.round(priceNumber * conversionRate);

      res.status(200).json({
        price: `Rp${IDRPrice}/year`
      });
    }
    
  } catch (error) {
    console.error('Failed to fetch data', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
