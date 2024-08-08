import React, { useState, useEffect, ChangeEvent } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { toast, ToastContainer, ToastOptions, ToastPosition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TodayGoldPricing from '@/components/TodayGoldPricing';
import GoldPortfolio from '@/components/GoldPortfolio';
import GoldPortfolioWithoutSellingPrice from '@/components/GoldPortfolioWithoutSellingPrice';
import { GoldBuyingPrice, GoldPricing, IGoldPortfolio } from '@/interfaces';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import Subscribe from '@/components/Subscribe';

interface GoldData {
  amount: number;
  date: string;
  price: number;
}

const toastConfig: ToastOptions = {
  position: "top-center" as ToastPosition,
  autoClose: 8000, // Keeps the toast visible for 8 seconds
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    width: "auto",
    maxWidth: "none"
  },
  progressStyle: {
    height: '8px'
  }
};

const Dashboard = () => {
  const [goldData, setGoldData] = useState<GoldData[]>([]);
  const [formData, setFormData] = useState({ amount: '', date: '', price: '', gram: '' });
  const [todayGoldPricing, setTodayGoldPricing] = useState<GoldPricing | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [goldPortfolio, setGoldPortfolio] = useState<IGoldPortfolio[]>([]);
  const [suggestedGoldPrice, setSuggestedGoldPrice] = useState<GoldBuyingPrice[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const [isProSubscriber, setIsProSubscriber] = useState(false); // New state for tracking subscription status

  const router = useRouter();
  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function fetchAuthStatus() {
      const hash = window.location.hash.substring(1); // remove the '#' at the start
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      const response = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sessionListener',
          access_token: accessToken,
          refresh_token: refreshToken
        })
      });
      const data = await response.json();
      if (data.authenticated) {
        console.log('user is authenticated in dashboard...')
        setUser(data.user);
      } else {
        console.log("user is not authenticated in dashboard, redirecting to login...");
        router.push('/login');
      }
    }
  
    fetchAuthStatus();
  }, []);

  useEffect(() => {
    const fetchGoldPrice = async () => {
      const response = await fetch('/api/todayGoldPricing');
      const data = await response.json();
      setTodayGoldPricing(data.todayGoldPricing);
    };

    fetchGoldPrice();
  }, []);

  const fetchGoldPortfolio = async () => {
    const response = await fetch(`/api/goldPortfolio?userId=${encodeURIComponent(user?.id as string)}`);
    const data = await response.json();
    setGoldPortfolio(data);
  };

  useEffect(() => {
    const fetchGoldBuyingPrice = async () => {
      const response = await fetch(`/api/goldPricing?priceDate=${formData.date}`);
      const data = await response.json();
      setSuggestedGoldPrice(data.goldBuyingPrice);
    };

    if (formData.date) {
      fetchGoldBuyingPrice();
    }
  }, [formData]);

  useEffect(() => {
    if (user) {
      fetchGoldPortfolio();
    }
  }, [user]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : '';
  }, [isDarkMode]);

  // useEffect(() => {
  //   const checkSubscriptionStatus = async () => {
  //     const status = await fetchSubscriptionStatus(user?.email as string);
  //     setIsProSubscriber(status);
  //   };

  //   if (user) {
  //     checkSubscriptionStatus();
  //   }
  // }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // This function fetches the subscription status of a user from your backend
  const fetchSubscriptionStatus = async (email: string) => {
    if (!email) return false;  // Ensure user ID is present

    try {
      const response = await fetch(`/api/checkSubscriptionStatus?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      return data.isActive;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return false;  // Default to false in case of an error
    }
  };

  const insertGoldPortfolio = async (amount: string, dateOfPurchase: string, purchasePrice: string, userId: string) => {
    const response = await fetch('/api/insertGoldPortfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, dateOfPurchase, purchasePrice, userId })
    });

    if (!response.ok) {
      throw new Error('Failed to insert gold portfolio data');
    }

    return await response.json();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // if (!isProSubscriber && goldPortfolio.length >= 2) {
    //   toast.error("Please subscribe to Pro Plan to add more portfolios", toastConfig);
    //   return;
    // }
    const newData = { amount: parseFloat(formData.amount), date: formData.date, price: parseFloat(formData.price) };
    setGoldData([...goldData, newData]);
    await insertGoldPortfolio(formData.amount, formData.date, formData.price, user?.id as string);
    await fetchGoldPortfolio();
  };

  const getPriceDetails = (gram: string) => {
    const price = suggestedGoldPrice.find(p => p.Gram === gram);
    return price ? { batangan: price["Antam per Batangan (Rp)"].split(' ')[0], perGram: price["Antam per Gram (Rp)"].split(' ')[0] } : { batangan: "Not available", perGram: "Not available" };
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormData((prevData) => {
      return { ...prevData, [name]: value };
    });
  };

  const handlePriceClick = (price: string) => {
    setFormData({ ...formData, price: price });
  };

  const handleGramClick = (gram: string) => {
    setFormData({ ...formData, amount: gram });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signOut'
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to sign out');
      console.log('Logged out successfully');
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="flex flex-col mx-auto px-4 md:px-20 min-h-screen dark:bg-gray-800">
      <header className="flex flex-wrap justify-between items-center bg-white py-2 dark:bg-gray-800 sticky top-0 z-50">
        <div className="flex items-center flex-1">
        {
          user && (
            <span className="text-md font-semibold dark:text-gray-400">Hi, {user.email}!</span>
          )
        }
        </div>
        <div className="flex items-center pr-20 flex-1">
          <div className="w-16 h-16 md:w-20 md:h-20 relative">
            <Link href="/" legacyBehavior>
              <a className="inline-block">
                <Image src="/goldofolio.png" alt="Company Logo" width={75} height={75} layout="responsive" />
              </a>
            </Link>
          </div>
          <h1 className="text-lg md:text-xl font-semibold dark:text-gray-400">Goldofolio</h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Logout
          </button>
          &nbsp;&nbsp;
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-600"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <MdLightMode className="text-yellow-500" /> : <MdDarkMode className="text-gray-800" />}
          </button>
        </div>
      </header>
      <div className="text-xl font-bold mb-4 dark:text-gray-400">Your Antam Gold Portfolio</div>
      {
        goldPortfolio.length > 0 ?
        (
          todayGoldPricing ?
          <GoldPortfolio initialData={goldPortfolio} goldSellingPrice={todayGoldPricing.gold_selling_price} userId={user?.id as string}/> :
          <GoldPortfolioWithoutSellingPrice initialData={goldPortfolio} userId={user?.id as string}/>
        ) :
        <p className="dark:text-gray-300">You don&apos;t have any gold portfolio. You can add your portfolio by inputting your data below.</p>
      }
      { todayGoldPricing ?
      <TodayGoldPricing 
        goldBuyingPrices={(todayGoldPricing as GoldPricing).gold_buying_price} 
        goldSellingPrice={(todayGoldPricing as GoldPricing).gold_selling_price}
        priceDate={(todayGoldPricing as GoldPricing).price_date} 
      /> : <div/> }
      <ToastContainer limit={3}/>
      <form onSubmit={handleSubmit} className="mb-4 w-1/2 mx-auto">
        <div className="mb-3">
          <label htmlFor="amount" className="block text-gray-700 text-md font-bold mb-2 mt-4 dark:text-gray-400">
            Amount of Gold (grams)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="gram" className="block text-gray-700 text-md font-bold mb-2 dark:text-gray-400">
            Choose Gram Amount for Purchase Price Suggestion
          </label>
          <select
            name="gram"
            value={formData.gram}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
            <option value="">Select Gram Amount</option>
            {suggestedGoldPrice && suggestedGoldPrice.map(option => (
              <option key={option.Gram} value={option.Gram}>
                {option.Gram} grams
              </option>
            ))}
          </select>
          {formData.gram && (
            <div className="mt-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <p className="text-md font-semibold dark:text-gray-400">
                Purchase Price Suggestion for&nbsp;
                <span
                  onClick={() => handleGramClick(formData.gram)} 
                  className="cursor-pointer text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                  role="button"
                  tabIndex={0}
                >
                  {formData.gram} Gram
                </span>: &nbsp;
                <span 
                  onClick={() => handlePriceClick(getPriceDetails(formData.gram).batangan.replace(/\./g, ""))} 
                  className="cursor-pointer text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                  role="button"
                  tabIndex={0}
                >
                  {getPriceDetails(formData.gram).batangan}
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="block text-gray-700 text-md font-bold mb-2 mt-4 dark:text-gray-400">
            Antam Purchase Price
          </label>
          <input
            type="decimal"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="block text-gray-700 text-md font-bold mb-2 dark:text-gray-400">
            Date of Purchase
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min="2013-11-08"
            max={todayDate}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            required
          />
        </div>
        <div className="flex justify-center">
          <button type="submit" className="mb-2 mt-2 bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
            Add Portfolio
          </button>
        </div>
      </form>
      {/* {!isProSubscriber && <Subscribe />} */}
      <footer className="mt-auto bg-white w-full border-t-2 border-gray-200 p-2 md:p-4 dark:bg-gray-800 dark:border-gray-700 sticky bottom-0 z-50">
        <div className="text-xs md:text-sm max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div>
                <p className="text-gray-800 dark:text-gray-400">© Goldofolio 2024 | PT. FADLAN SOLUSI TEKNOLOGI</p>
            </div>
            <div>
                <p className="text-gray-600 dark:text-gray-400">
                    Gold price data sourced from:&nbsp;
                    <a href="https://harga-emas.org/history-harga" className="hover:text-blue-600 transition duration-300 ease-in-out">harga-emas.org</a>
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
