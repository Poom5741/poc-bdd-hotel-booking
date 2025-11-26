import { useState } from 'react';
import { useRouter } from 'next/router';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Login failed');
      }

      const data = await res.json();
      if (data.role !== 'admin') {
        throw new Error('Access denied');
      }

      document.cookie = `admin_auth_token=${data.token}; path=/`;
      localStorage.setItem('admin_role', data.role);
      localStorage.setItem('admin_email', data.email);
      await router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Admin Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Email
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="admin@example.com"
            />
          </label>
          <label className="label">
            Password
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
