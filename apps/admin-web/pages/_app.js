import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function App({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    const announcer = document.getElementById('__next-route-announcer__');
    if (announcer) {
      announcer.setAttribute('aria-hidden', 'true');
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default App;
