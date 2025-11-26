import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = getCookie('auth_token');
    const savedEmail = localStorage.getItem('auth_email') || '';
    if (!token) {
      router.replace('/login');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Dashboard</h1>
        <p className="welcome-message">
          {email ? `Welcome back, ${email}` : 'Welcome to your dashboard'}
        </p>
      </section>
    </main>
  );
}

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];
}
