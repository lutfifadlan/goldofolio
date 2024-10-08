import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signup = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signUp',
          email,
          password,
        })
      });
      const result = await response.json();
      if (!response.ok && result.error) {
        toast.error(result.message);
        throw new Error(result.message || 'Failed to sign up');
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Error signing up:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 w-full max-w-md bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-center mb-3">
            <Image src="/goldofolio.png" alt="Company Logo" width={150} height={150} className="animate-bounce" />
          </div>
          <form onSubmit={signup}>
            <ToastContainer
              position='top-center'
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
              <input type="email" placeholder="Enter your email"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:border-black focus:ring-black focus:outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" placeholder="Enter your password"
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:border-black focus:ring-black focus:outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="mt-6">
              <button className="w-full px-4 py-2 bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100">Sign Up</button>
            </div>
            <div className="mt-4 text-center">
              <Link href="/login" passHref legacyBehavior>
                <a className="text-black hover:underline">Already have an account? Login up here!</a>
              </Link>
            </div>
          </form>
        </div>
      </div>

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

export default Signup;
