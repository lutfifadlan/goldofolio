import { useEffect, useState } from 'react';

const Subscribe = () => {
  const [price, setPrice] = useState<string | null>(null);
  const [IDRPrice, setIDRPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionPrice = async () => {
      const response = await fetch(`/api/checkSubscriptionPrice`);
      const data = await response.json();
      if (data && data.price) {
        setPrice(data.price.replace(' a year', '/year'));
      }
    };

    fetchSubscriptionPrice();
  }, []);

  useEffect(() => {
    const fetchIDRSubscriptionPrice = async () => {
      try {
        const response =  await fetch(`/api/fetchIDRSubscriptionPrice?price=${price}`);
        const data = await response.json();
        if (response.ok) {
          setIDRPrice(data.price);
        } else {
          throw new Error(data.error || 'An error occurred while fetching the price');
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    if (price) {
      fetchIDRSubscriptionPrice();
    }
  }, [price]);

  return (
    <div className="flex justify-center items-center mt-2 mb-6">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-400">Subscribe to Pro Plan</h2>
        <p className="text-center text-gray-800 dark:text-gray-400 mt-4 mb-3">
          Track all of your gold portfolios without limit
        </p>
        <div className="flex justify-center">
          {price ? (
            <button disabled className="flex justify-center mb-4 py-2 px-4 rounded bg-yellow-300 dark:bg-yellow-600 text-lg text-gray-800 d
  ark:text-gray-50 font-semibold">
              {price} <br/> ({IDRPrice})
            </button>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading price...</p>
          )}
        </div>
        <div className="flex justify-center">
          <a href="https://gumroad.com/l/finxj" target="_blank" rel="noopener noreferrer">
            <button
              className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Subscribe via Gumroad
            </button>
          </a>
        </div>
        <div className="flex justify-center text-gray-800 dark:text-gray-400 text-xs mt-3">
          The IDR(Rp) price is fetched from https://v6.exchangerate-api.com. The actual amount of subscription charge might be slightly different
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
