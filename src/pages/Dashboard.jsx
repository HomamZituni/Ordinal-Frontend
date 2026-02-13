import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({
    name: '',
    last4: '',
    network: 'Visa'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;
  const [gamification, setGamification] = useState(null);

  useEffect(() => {
    fetchCards();
    fetchGamification(); 
  }, []);

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

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardName: newCard.name,
          issuer: newCard.network,
          cardType: newCard.network,
          lastFourDigits: newCard.last4
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create card');
      }

      await fetchCards();
      setNewCard({ name: '', last4: '', network: 'Visa' });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cardId) => {
    navigate(`/cards/${cardId}`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Hello, {user?.email}</span>
          <button onClick={logout} style={{ padding: '8px 15px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

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
                  width: `${Math.min(gamification.progressPercent, 100)}%`,
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
 
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Add New Card</h2>
        <form onSubmit={handleCreateCard}>
          <div style={{ marginBottom: '15px' }}>
            <label>Card Nickname:</label>
            <input
              type="text"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              placeholder="e.g., Chase Sapphire"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Last 4 Digits:</label>
            <input
              type="text"
              value={newCard.last4}
              onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
              placeholder="1234"
              maxLength="4"
              pattern="\d{4}"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

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

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Adding...' : 'Add Card'}
          </button>
        </form>
      </div>

      <div>
        <h2>Your Cards</h2>
        {cards.length === 0 ? (
          <p>No cards yet. Add your first card above!</p>
        ) : (
          <div>
            {cards.map((card) => (
              <div
                key={card._id}
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

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleCardClick(card._id)}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

