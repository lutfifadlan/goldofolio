import React, { useState, useEffect } from 'react';
import { IGoldPortfolio } from '@/interfaces'
import { EditGoldPortfolioModal } from '@/components/EditGoldPortfolioModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

type Props = {
  initialData: IGoldPortfolio[];
  userId: string;
};

const GoldPortfolioWithoutSellingPrice: React.FC<Props> = ({ initialData, userId }) => {
  const [data, setData] = useState<IGoldPortfolio[]>(initialData);
  const [sortConfig, setSortConfig] = useState<{ key: keyof IGoldPortfolio; direction: 'ascending' | 'descending' } | null>(null);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<IGoldPortfolio | null>(null);

  useEffect(() => {
    refreshData();
  }, [initialData]);

  const editRecord = async (item: IGoldPortfolio): Promise<void> => {
    setCurrentItem(item);
    setModalIsOpen(true);
  };

  const numberFormatter = new Intl.NumberFormat('de-DE');

  const requestSort = (key: keyof IGoldPortfolio) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (
          sortConfig &&
          sortConfig.key === key &&
          sortConfig.direction === 'ascending'
      ) {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };

  const refreshData = async () => {
    if (!userId) return;
  
    const response = await fetch(`/api/goldPortfolio?userId=${encodeURIComponent(userId)}`);
    const newData = await response.json();
    setData(newData); // Set new data which will trigger sorting in useMemo
  };

  const deleteRecord = async (id: string) => {
    const response = await fetch('/api/deleteGoldPortfolio', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  
    if (response.ok) {
      refreshData();
    } else {
      const errorData = await response.json();
      console.error('Failed to delete the record:', errorData.error);
    }
  };
  
  const handleEditSubmit = async (item: IGoldPortfolio) => {
    const response = await fetch('/api/editGoldPortfolio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
  
    if (response.ok) {
      refreshData();
    } else {
      const errorData = await response.json();
      console.error('Failed to edit the record:', errorData.error);
    }
  };

  return (
    <div className="overflow-x-auto relative shadow-md">
      <p className="text-gray-500 font-semibold mb-4 dark:text-white">
        Today&apos;s selling price is not available yet hence the data display is limited.
      </p>
      <table className="w-full text-md text-left text-gray-500 dark:text-gray-400">
        {currentItem && (
          <EditGoldPortfolioModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            defaultValues={currentItem}
            onSubmit={handleEditSubmit}
          />
        )}
        <thead className="text-md text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-2 px-3">Action</th>
            <th scope="col" className="py-2 px-3" onClick={() => requestSort('created_at')}>Created At</th>
            <th scope="col" className="py-2 px-3" onClick={() => requestSort('updated_at')}>Updated At</th>
            <th scope="col" className="py-2 px-3" onClick={() => requestSort('gold_weight')}>Gold Weight (Grams)</th>
            <th scope="col" className="py-2 px-3" onClick={() => requestSort('gold_buying_date')}>Buying Date</th>
            <th scope="col" className="py-2 px-3" onClick={() => requestSort('gold_buying_price')}>Buying Price (Rp)</th>
          </tr>
        </thead>
        <tbody>
            {sortedData && sortedData.map(item => (
              <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-2 px-3 flex items-center justify-start space-x-2">
                  <button
                      onClick={() => editRecord(item)}
                      className="text-black hover:text-gray-800 p-2 rounded focus:outline-none focus:shadow-outline dark:text-gray-400 dark:hover:text-white">
                      <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                      onClick={() => deleteRecord(item.id)}
                      className="text-black hover:text-gray-800 p-2 rounded focus:outline-none focus:shadow-outline dark:text-gray-400 dark:hover:text-white">
                      <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </td>
                <td className="py-2 px-3">{formatDate(item.created_at)}</td>
                <td className="py-2 px-3">{formatDate(item.updated_at)}</td>
                <td className="py-2 px-3">{item.gold_weight}</td>
                <td className="py-2 px-3">{item.gold_buying_date}</td>
                <td className="py-2 px-3">{numberFormatter.format(item.gold_buying_price)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
  const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);

  return `${formattedDate}, ${formattedTime}`;
}

export default GoldPortfolioWithoutSellingPrice;
