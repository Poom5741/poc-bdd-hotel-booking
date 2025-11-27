import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = getCookie('admin_auth_token');
      const guestToken = getCookie('auth_token');
      const role = typeof window !== 'undefined' ? localStorage.getItem('admin_role') : null;
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('admin_email') || '' : '';

      // Check if guest user (has auth_token but not admin_auth_token) is trying to access
      if (guestToken && !adminToken) {
        setAccessDenied(true);
        setLoading(false);
        setTimeout(() => {
          router.replace('/admin/login');
        }, 2000);
        return;
      }

      if (!adminToken || role !== 'admin') {
        router.replace('/admin/login');
        return;
      }

      setEmail(savedEmail);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (accessDenied) {
    return (
      <main className="page">
        <section className="card">
          <h1 className="title">Admin Dashboard</h1>
          <p className="error-message">Access denied</p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <section className="card">
          <h1 className="title">Admin Dashboard</h1>
          <p>Loading...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Admin Dashboard</h1>
        <p className="admin-welcome-message">
          {email ? `Welcome, ${email}` : 'Welcome, admin'}
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
