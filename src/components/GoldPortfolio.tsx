import React, { useState, useEffect } from 'react';
import { IGoldPortfolio } from '@/interfaces'
import { EditGoldPortfolioModal } from '@/components/EditGoldPortfolioModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'; // Adjust path if using outline icons

type Props = {
  initialData: IGoldPortfolio[];
  goldSellingPrice: string;
  userId: string;
};

const GoldPortfolio: React.FC<Props> = ({ initialData, goldSellingPrice, userId }) => {
  const [data, setData] = useState<IGoldPortfolio[]>(initialData);
  const [sortConfig, setSortConfig] = useState<{ key: keyof IGoldPortfolio; direction: 'ascending' | 'descending' } | null>({
    key: 'created_at',
    direction: 'descending'
  });

  const calculateSellingPrice = (item: IGoldPortfolio) => {
    return convertRpToNumber(goldSellingPrice) * item.gold_weight;
  }

  const calculateGains = (item: IGoldPortfolio) => {
    return calculateSellingPrice(item) - item.gold_buying_price;
  }

  const convertRpToNumber = (rpString: string): number => {
    let numericPart = rpString.replace(/[^0-9.]/g, '');
    numericPart = numericPart.replace(/\./g, '');
    return parseInt(numericPart, 10);
  }

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = sortConfig.key === 'todaySellingPrice' ? calculateSellingPrice(a) : sortConfig.key === 'gains' ? calculateGains(a) : a[sortConfig.key];
        const bValue = sortConfig.key === 'todaySellingPrice' ? calculateSellingPrice(b) : sortConfig.key === 'gains' ? calculateGains(b) : b[sortConfig.key];

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
    setSortConfig(null);
    let direction: 'ascending' | 'descending' = 'descending';
    if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === 'descending'
    ) {
      direction = 'ascending';
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
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('created_at')}>
              {
                sortConfig?.key === 'created_at' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'created_at' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Created At
            </th>
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('updated_at')}>
              {
                sortConfig?.key === 'updated_at' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'updated_at' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Updated At
            </th>
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('gold_weight')}>
              {
                sortConfig?.key === 'gold_weight' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'gold_weight' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Gold Weight (Grams)
            </th>
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('gold_buying_date')}>
              {
                sortConfig?.key === 'gold_buying_date' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'gold_buying_date' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Buying Date
            </th>
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('gold_buying_price')}>
              {
                sortConfig?.key === 'gold_buying_price' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'gold_buying_price' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Buying Price (Rp)
            </th>
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('todaySellingPrice')}>
              {
                sortConfig?.key === 'todaySellingPrice' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'todaySellingPrice' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Today Selling Price (Rp)
            </th>
            <th scope="col" className="py-2 px-3 cursor-pointer" onClick={() => requestSort('gains')}>
              {
                sortConfig?.key === 'gains' && sortConfig?.direction === 'ascending' ?
                <ArrowUpIcon className="h-4 w-4 inline" /> :
                (sortConfig?.key === 'gains' && sortConfig?.direction === 'descending' ?
                  <ArrowDownIcon className="h-4 w-4 inline" /> :
                  null
                )
              }
              &nbsp;Gains (Rp)
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.map(item => (
            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-2 px-3 flex items-center justify-start space-x-2">
                <button onClick={() => editRecord(item)} className="text-black hover:text-gray-800 p-2 rounded focus:outline-none focus:shadow-outline dark:text-gray-400 dark:hover:text-white">
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={() => deleteRecord(item.id)} className="text-black hover:text-gray-800 p-2 rounded focus:outline-none focus:shadow-outline dark:text-gray-400 dark:hover:text-white">
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
              <td className="py-2 px-3">{formatDate(item.created_at)}</td>
              <td className="py-2 px-3">{formatDate(item.updated_at)}</td>
              <td className="py-2 px-3">{item.gold_weight}</td>
              <td className="py-2 px-3">{item.gold_buying_date}</td>
              <td className="py-2 px-3">{numberFormatter.format(item.gold_buying_price)}</td>
              <td className="py-2 px-3">{numberFormatter.format(calculateSellingPrice(item))}</td>
              <td className="py-2 px-3">{
                calculateGains(item) > 0 ? '+' + numberFormatter.format(calculateGains(item)) :
                numberFormatter.format(calculateGains(item))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <td colSpan={3} className="text-right py-2 px-3 font-semibold">Total</td>
            <td className="py-2 px-3">{sortedData.reduce((sum, item) => sum + item.gold_weight, 0)}</td>
            <td colSpan={3}></td>
            <td className="py-2 px-3">{
              sortedData.reduce((sum, item) => sum + calculateGains(item), 0) > 0 ?
              "+" + numberFormatter.format(sortedData.reduce((sum, item) => sum + calculateGains(item), 0)) :
              numberFormatter.format(sortedData.reduce((sum, item) => sum + calculateGains(item), 0))}
            </td>
          </tr>
        </tfoot>
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

export default GoldPortfolio;
