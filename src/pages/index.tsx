import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 dark:bg-gray-800">
      <Head>
        <title>Goldofolio - Track Your Gold Investments</title>
        <meta name="description" content="Goldofolio helps you track and analyze your gold investments, seeing the benefits and value growth over time." />
        <link rel="icon" href="/goldofolio.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="mb-2">
          <Image src="/goldofolio.png" alt="Goldofolio Logo" width={150} height={150} className="animate-bounce" />
        </div>
        <h1 className="text-6xl font-bold dark:text-gray-400">
          Welcome to Goldofolio
        </h1>
        <p className="mt-3 text-2xl dark:text-gray-300">
          The ultimate tool for gold investors.
        </p>
        <ul className="mt-4 text-lg dark:text-gray-400 list-disc list-inside">
          <li>Track and manage up to 2 gold portfolios for free.</li>
          <li>View today&apos;s Antam gold prices directly.</li>
          <li>Receive suggestions on gold purchase prices.</li>
          <li>See real-time gains on your gold investments.</li>
          <li>Upgrade to track unlimited portfolios with our Pro Plan.</li>
        </ul>
        <div className="mt-6">
          <Link href="/login" passHref>
            <button className="px-6 py-3 bg-white text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Get Started
            </button>
          </Link>
        </div>
      </main>

      <footer className="mt-auto bg-white w-full border-t-2 border-gray-200 p-2 md:p-4 dark:bg-gray-800 dark:border-gray-700">
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
  )
}

export default Home;
