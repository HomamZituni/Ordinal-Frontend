import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
const API_URL = import.meta.env.VITE_API_URL;


export default function Register() {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for error messages
  const [error, setError] = useState('');
  
  // State to track if API call is in progress
  const [loading, setLoading] = useState(false);
  
  // Get login function to auto-login user after successful registration
  const { login } = useAuth();
  
  // Get navigate function to redirect after registration
  const navigate = useNavigate();
  
  // Get backend API URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(''); // Clear previous errors
    
    // Check if passwords match before sending to backend
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return; // Stop here, don't make API call
    }
    
    setLoading(true); // Show loading state

    try {
      // Make POST request to backend register endpoint
      console.log('API_URL is:', API_URL);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }) // Send email and password
      });

      // Parse JSON response from backend
      const data = await response.json();

      // Check if registration failed
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If successful: auto-login the user with returned data
      login(data.user, data.token);
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      // Display error message to user
      setError(err.message);
      
    } finally {
      // Stop loading state
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Register for Ordinal</h1>
      
      {/* Show error message if exists */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Username input */}
    <div style={{ marginBottom: '15px' }}>
    <label>Username:</label>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
    />
    </div>


        {/* Password input */}
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Confirm password input */}
        <div style={{ marginBottom: '15px' }}>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {/* Link to Login page */}
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}
