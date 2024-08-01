import React, { useState } from 'react';
import Modal from 'react-modal';
import { IGoldPortfolio } from "@/interfaces"

interface EditModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  defaultValues: IGoldPortfolio;
  onSubmit: (values: IGoldPortfolio) => Promise<void>;
}

Modal.setAppElement('#__next');

export const EditGoldPortfolioModal: React.FC<EditModalProps> = ({
  isOpen, onRequestClose, defaultValues, onSubmit
}) => {
    const [goldWeight, setGoldWeight] = useState<number>(defaultValues.gold_weight);
    const [goldBuyingPrice, setGoldBuyingPrice] = useState<number>(defaultValues.gold_buying_price);
    const [goldBuyingDate, setGoldBuyingDate] = useState<string>(defaultValues.gold_buying_date);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSubmit({
          id: defaultValues.id,
          gold_weight: goldWeight,
          gold_buying_date: goldBuyingDate,
          gold_buying_price: goldBuyingPrice,
          created_at: defaultValues.created_at,
          updated_at: defaultValues.updated_at,
          user_id: defaultValues.user_id
        });
        onRequestClose();
    };

    return (
      <Modal
          isOpen={isOpen}
          onRequestClose={onRequestClose}
          contentLabel="Edit Gold Portfolio Entry"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-xl max-w-md w-full dark:bg-gray-800 dark:text-gray-400"
          overlayClassName="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50"
      >
          <h2 className="text-lg font-semibold text-center mb-4">Edit Gold Portfolio</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Gold Weight (grams):
                      <input
                          type="number"
                          value={goldWeight}
                          onChange={e => setGoldWeight(parseFloat(e.target.value))}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      />
                  </label>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Buying Price (IDR):
                      <input
                          type="number"
                          value={goldBuyingPrice}
                          onChange={e => setGoldBuyingPrice(parseFloat(e.target.value))}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      />
                  </label>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Buying Date:
                      <input
                          type="date"
                          value={goldBuyingDate}
                          onChange={e => setGoldBuyingDate(e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      />
                  </label>
              </div>
              <div className="flex justify-end space-x-4">
                  <button type="button" onClick={onRequestClose} className="py-2 px-4 bg-white text-gray-800 font-semibold border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                      Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 bg-white text-gray-800 font-semibold border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                      Submit
                  </button>
              </div>
          </form>
      </Modal>
    );
};
