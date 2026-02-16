import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  console.log('API_URL:', API_URL);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>Ordinal</h1>
          <p style={styles.tagline}>Strategic Rewards Management</p>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
container: {
  minHeight: '100vh',
  background: '#1F2A3A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  width: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
}
,
  card: {
    background: '#243447',
    borderRadius: '12px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#C9A84E',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px'
  },
  tagline: {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: 0
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 24px 0'
  },
  error: {
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    color: '#FCA5A5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    background: '#1F2A3A',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    background: '#C9A84E',
    color: '#1F2A3A',
    border: 'none',
    borderRadius: '8px',
    marginTop: '8px',
    transition: 'all 0.2s'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#9CA3AF'
  },
  link: {
    color: '#C9A84E',
    fontWeight: '600',
    textDecoration: 'none'
  }
};


