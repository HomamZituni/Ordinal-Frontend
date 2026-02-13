import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';


export default function Dashboard() {
  // Get user data and token from AuthContext
  const { user, token, logout } = useAuth();
  
  // Navigate function to go to card detail page
  const navigate = useNavigate();
  
  // State to store list of user's cards
  const [cards, setCards] = useState([]);
  
  // State for create card form inputs
  const [newCard, setNewCard] = useState({
    name: '',
    last4: '',
    network: 'Visa' // Default value
  });
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get API URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // state for gamification spend notification 
  const [gamification, setGamification] = useState(null);

  // Fetch user's cards when component loads
  useEffect(() => {
    fetchCards();
    fetchGamification(); 
  }, []); // Empty array = run once on mount

  // Function to get all cards from backend
  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(data.message || 'Failed to fetch cards');
      }

      setCards(data);
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to get gamification data from backend
  const fetchGamification = async () => {
    try {
      const response = await fetch(`${API_URL}/cards/gamification`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setGamification(data);
      }
      
    } catch (err) {
      console.log('Gamification not available');
    }
  };

  // Handle form submission to create new card
  const handleCreateCard = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(''); // Clear previous errors
    setLoading(true);

    try {
      // Make POST request to create card
      const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Authentication required
        },
        body: JSON.stringify({
          cardName: newCard.name,        // Map name → cardName
          issuer: newCard.network,        // Map network → issuer
          cardType: newCard.network,      // Add cardType (same as network)
          lastFourDigits: newCard.last4   // Map last4 → lastFourDigits
        })
      });


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create card');
      }

      // Success! Refresh the cards list
      await fetchCards();
      
      // Reset form to empty values
      setNewCard({ name: '', last4: '', network: 'Visa' });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleGenerateTransactions = async (cardId) => {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}/transactions/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate transactions');
    }

    alert('Transactions generated successfully!');
    
  } catch (err) {
    setError(err.message);
  }
};



  // Handle clicking on a card to view its details
  const handleCardClick = (cardId) => {
  navigate(`/cards/${cardId}`); // Changed from /card/ to /cards/
};


  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      {/* Header with user info and logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Hello, {user?.email}</span>
          <button onClick={logout} style={{ padding: '8px 15px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

     {/* Gamification Section - Show progress toward top reward */}
{gamification && (
  <div style={{ 
    marginBottom: '30px', 
    padding: '20px', 
    border: '2px solid #4CAF50', 
    borderRadius: '8px',
    backgroundColor: '#f0f8f0'
  }}>
    <h2 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🎯 Your Progress</h2>
    <p style={{ margin: '10px 0', fontSize: '16px' }}>
      {gamification.message}
    </p>
    
    {/* Progress bar */}
    {gamification.progressPercent !== undefined && (
      <div style={{ marginTop: '15px' }}>
        <div style={{ 
          width: '100%', 
          height: '30px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(gamification.progressPercent, 100)}%`, // Cap at 100%
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {gamification.progressPercent.toFixed(0)}%
          </div>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          Current: {gamification.currentPoints} points | 
          Goal: {gamification.targetPoints} points
        </p>
      </div>
    )}
  </div>
)}
 
      {/* Show error message if exists */}
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {/* Section: Create New Card */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Add New Card</h2>
        <form onSubmit={handleCreateCard}>
          {/* Card nickname input */}
          <div style={{ marginBottom: '15px' }}>
            <label>Card Nickname:</label>
            <input
              type="text"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} // Update only 'name' field
              placeholder="e.g., Chase Sapphire"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          {/* Last 4 digits input */}
          <div style={{ marginBottom: '15px' }}>
            <label>Last 4 Digits:</label>
            <input
              type="text"
              value={newCard.last4}
              onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
              placeholder="1234"
              maxLength="4" // Limit to 4 characters
              pattern="\d{4}" // Only accept 4 digits
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          {/* Network dropdown */}
          <div style={{ marginBottom: '15px' }}>
            <label>Network:</label>
            <select
              value={newCard.network}
              onChange={(e) => setNewCard({ ...newCard, network: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">Amex</option>
              <option value="Discover">Discover</option>
            </select>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Adding...' : 'Add Card'}
          </button>
        </form>
      </div>

      {/* Section: List of Cards */}
      <div>
        <h2>Your Cards</h2>
        {cards.length === 0 ? (
          // Show message if no cards
          <p>No cards yet. Add your first card above!</p>
        ) : (
          // Show cards as clickable items
          <div>
  {cards.map((card) => (
    <div
      key={card._id} // Unique key for React list rendering
      style={{
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}
    >
<h3 style={{ margin: '0 0 5px 0' }}>{card.cardName}</h3>
<p style={{ margin: '0 0 10px 0', color: '#666' }}>
  {card.issuer} •••• {card.lastFourDigits}
</p>

      
      {/* Action buttons */}
<div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => handleCardClick(card._id)} // Navigate to card detail on click
    style={{
      padding: '8px 15px',
      cursor: 'pointer',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    View Transactions
  </button>
  <button
    onClick={() => navigate(`/cards/${card._id}/rewards`)}
 // Navigate to rewards page
    style={{
      padding: '8px 15px',
      cursor: 'pointer',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    View Rewards
  </button>
  <button
    onClick={() => handleGenerateTransactions(card._id)}
    style={{
      padding: '8px 15px',
      cursor: 'pointer',
      backgroundColor: '#FF9800',
      color: 'white',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    Generate Transactions
  </button>
</div>

    </div>
  ))}
</div>
        )}
      </div>
    </div>
  );
}
