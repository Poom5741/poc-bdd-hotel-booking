// pages/index.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1] : null;
    
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="page">
      <section className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="title" style={{ marginBottom: '16px', fontSize: 'var(--font-size-3xl)' }}>
          StayFlex Hotel
        </h1>
        <p style={{ 
          marginBottom: '32px', 
          color: 'var(--color-text-secondary)', 
          fontSize: 'var(--font-size-lg)',
          lineHeight: 1.6
        }}>
          Discover your perfect stay. Book beautiful rooms with ease and enjoy exceptional hospitality.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="submit-button" 
            onClick={() => router.push('/search')}
            style={{ minWidth: '180px' }}
          >
            Search Rooms
          </button>
          <button 
            className="submit-button"
            onClick={() => router.push('/login')}
            style={{ 
              minWidth: '180px',
              background: 'transparent',
              border: '2px solid var(--color-primary)',
              color: 'var(--color-primary)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'var(--color-primary)';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--color-primary)';
            }}
          >
            Sign In
          </button>
        </div>
      </section>
    </main>
  );
}
