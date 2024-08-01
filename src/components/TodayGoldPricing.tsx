import React, { useState } from 'react';

interface GoldPrice {
  Gram: string;
  "Antam per Batangan (Rp)": string;
  "Antam per Gram (Rp)": string;
}

interface Props {
  goldBuyingPrices: GoldPrice[];
  goldSellingPrice: string;
  priceDate: string;
}

const TodayGoldPricing: React.FC<Props> = ({ goldBuyingPrices, goldSellingPrice, priceDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const numberFormatter = new Intl.NumberFormat('de-DE');

  return (
    <div className="container mx-auto p-2 sm:p-4 dark:bg-gray-800">
      <div className="flex justify-center">
        <button
          className="mb-4 mt-4 bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? `Hide Today's Prices (${priceDate})` : `Show Today's Prices (${priceDate})`}
        </button>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto mt-4 shadow-lg sm:rounded-lg">
          <table className="w-1/2 mx-auto text-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 py-2 text-center font-semibold text-gray-900 dark:text-gray-400">
                    Gram
                  </th>
                  <th scope="col" className="px-3 py-2 text-center font-semibold text-gray-900 dark:text-gray-400">
                    Buying Price Per Gram (Rp)
                  </th>
                  <th scope="col" className="px-3 py-2 text-center font-semibold text-gray-900 dark:text-gray-400">
                    Total Buying Price (Rp)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {goldBuyingPrices.map((price, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 whitespace-nowrap text-center font-medium text-gray-900 dark:text-gray-300">{price.Gram}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">{price["Antam per Gram (Rp)"].split(' ')[0]}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">{numberFormatter.format(parseInt(price["Antam per Gram (Rp)"].split(' ')[0].replace(/\./g, ''), 10) * parseFloat(price.Gram))}</td>
                    </tr>
                  ))}
              </tbody>
          </table>
          <p className="mt-4 p-2 text-left text-md font-medium text-gray-900 flex justify-center dark:text-gray-300">Selling Price: Rp{goldSellingPrice}</p>
        </div>
      )}
    </div>
  );
};

export default TodayGoldPricing;
