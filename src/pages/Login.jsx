import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
//State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //state for error messages
  const [error, setError] = useState('');
  //state to track API call progress
  const [loading, setLoading] = useState(false);
  //Get the login function from AuthContext to save user data after successful login
  const { login } = useAuth();
  //Get navigate function to redirect user after login
  const navigate = useNavigate();
  //Get backend API URl from .env file 
  const API_URL = import.meta.env.VITE_API_URL;
  //Handle form submission 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try { //POST request to backend login endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      //parse the JSON response from backend
      const data = await response.json();
      //check if request failed (status code 400, etc..)
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
//if successful save user data and token to AuthContext
      login(data.user, data.token);
      //redirect to user dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message); //display error if there is issue
    } finally {
      setLoading(false); //stop loading state once resolved
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Login to Ordinal</h1> 
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} 
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email} //controlled input value comes from state
            onChange={(e) => setEmail(e.target.value)} //update state on keystrokes
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password} //controlled input 
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} //prevent multiple clicks while request in progress
          style={{ width: '100%', padding: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
