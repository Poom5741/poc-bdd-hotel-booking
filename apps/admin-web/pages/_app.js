import '../styles/globals.css';
import { useEffect } from 'react';

function App({ Component, pageProps }) {
  useEffect(() => {
    const announcer = document.getElementById('__next-route-announcer__');
    if (announcer) {
      announcer.setAttribute('aria-hidden', 'true');
    }
  }, []);
  return <Component {...pageProps} />;
}

export default App;
