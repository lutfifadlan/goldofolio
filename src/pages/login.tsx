import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      const response = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sessionListener',
        })
      });
      const data = await response.json();
      if (data.authenticated) {
        console.log("User is authenticated, redirecting to dashboard...");
        router.push('/dashboard');
      }
    }

    fetchSession();
  }, []);

  const login = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signInWithPassword',
          email,
          password,
        })
      });
      const result = await response.json();
      if (!response.ok) {
        console.log('Failed to login...');
        toast.error(result.message);
        throw new Error(result.error || 'Failed to login');
      }
      console.log('Login successfully');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error logging in:', err);
    }
  };

  const googleLogin = async () => {
    try {
      const response = await fetch('/api/auth/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signInWithProvider',
          provider: 'google'
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to login with Google');
      router.push(result.url);
    } catch (err) {
      console.error('Error logging in:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 w-full max-w-md bg-white rounded shadow">
          <div className="flex items-center justify-center mb-3">
            <Link href="/" legacyBehavior>
              <a className="inline-block">
                <Image src="/goldofolio.png" alt="Company Logo" width={150} height={150} className="animate-bounce"/>
              </a>
            </Link>
          </div>
          <form onSubmit={login}>
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
              <button className="w-full bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100">Login</button>
            </div>
          </form>
          <div className="mt-4 flex justify-center">
            <button
              onClick={googleLogin}
              className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100"
            >
              <Image
                src="/google.svg"
                alt="Google sign-in"
                width={20}
                height={20}
                unoptimized
              />
              <span>&nbsp; Sign in with Google</span>
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/signup" passHref legacyBehavior>
              <a className="text-black hover:underline">Don&apos;t have an account? Sign up here!</a>
            </Link>
          </div>
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

export default Login;
