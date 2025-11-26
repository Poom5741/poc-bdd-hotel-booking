import { useState } from 'react';
import { useRouter } from 'next/router';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (email === 'admin@stayflex.test' && password === 'admin123') {
        document.cookie = `admin_auth_token=token-admin; path=/`;
        router.push('/admin/dashboard');
        return;
      }
      throw new Error('Invalid credentials');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Admin Login</h1>
        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Email
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>
          <label className="label">
            Password
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
