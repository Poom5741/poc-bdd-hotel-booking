import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = getCookie('admin_auth_token');
    if (!token) {
      setMessage('Access denied');
      setTimeout(() => {
        router.replace('/admin/login');
      }, 300);
    }
  }, [router]);

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Admin Dashboard</h1>
        {message && <p className="error-message">{message}</p>}
        <p className="admin-welcome-message">Welcome, admin</p>
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
