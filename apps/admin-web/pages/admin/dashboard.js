import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = getCookie('admin_auth_token');
    const role = localStorage.getItem('admin_role');
    const savedEmail = localStorage.getItem('admin_email') || '';

    if (!token || role !== 'admin') {
      router.replace('/admin/login');
      return;
    }

    setEmail(savedEmail);
  }, [router]);

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
