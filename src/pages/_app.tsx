import '../app/globals.css'; // Adjust the path according to your project structure
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/goldofolio.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
