import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Rewards() {
  // Get cardId from URL params (e.g., /rewards/123abc)
  const { cardId } = useParams();
  
  // Get token for API authentication
  const { token, logout } = useAuth();
  
  // Navigate function
  const navigate = useNavigate();
  
  // State for card info and rewards
  const [card, setCard] = useState(null);
  const [rewards, setRewards] = useState([]);
  
  // State for AI toggle (true = ranked, false = unranked)
  const [aiEnabled, setAiEnabled] = useState(true);
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Get API URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch card and rewards when component loads
  useEffect(() => {
    fetchCardAndRewards();
  }, [cardId, aiEnabled]); // Re-run when cardId or aiEnabled changes

  // Function to get card details and rewards from backend
  const fetchCardAndRewards = async () => {
    setLoading(true);
    try {
      // Fetch card details
      const cardResponse = await fetch(`${API_URL}/cards/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const cardData = await cardResponse.json();

      if (!cardResponse.ok) {
        if (cardResponse.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(cardData.message || 'Failed to fetch card');
      }

      setCard(cardData);

      // Fetch rewards - use different endpoint based on AI toggle
      const rewardsUrl = aiEnabled 
        ? `${API_URL}/cards/${cardId}/recommendations` // AI ranked rewards
        : `${API_URL}/cards/${cardId}/rewards`; // Unranked rewards list

      const rewardsResponse = await fetch(rewardsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const rewardsData = await rewardsResponse.json();

      if (!rewardsResponse.ok) {
        throw new Error(rewardsData.message || 'Failed to fetch rewards');
      }

      setRewards(rewardsData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh button (recalculates AI rankings)
  const handleRefresh = async () => {
    if (!aiEnabled) {
      // Can't refresh when AI is off
      alert('Enable AI ranking to refresh recommendations');
      return;
    }

    setRefreshing(true);
    setError('');

    try {
      // Call refresh endpoint to recalculate rankings
      const response = await fetch(`${API_URL}/cards/${cardId}/recommendations/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh recommendations');
      }

      // Success! Reload rewards with new rankings
      await fetchCardAndRewards();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle AI ranking on/off
  const handleToggleAI = () => {
    setAiEnabled(!aiEnabled); // Flip the boolean
    // useEffect will automatically re-fetch with new setting
  };

  // Show loading message while fetching data
  if (loading && !card) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
      {/* Header with back button */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 15px', cursor: 'pointer', marginBottom: '15px' }}
        >
          ← Back to Dashboard
        </button>
        <h1>Rewards</h1>
        {card && <p style={{ color: '#666' }}>{card.name} • {card.network} •••• {card.last4}</p>}
      </div>

      {/* Show error message if exists */}
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {/* Control panel: AI toggle and Refresh button */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* AI Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>AI Ranking:</label>
            <button
              onClick={handleToggleAI}
              style={{
                padding: '8px 15px',
                cursor: 'pointer',
                backgroundColor: aiEnabled ? '#4CAF50' : '#999',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </button>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {aiEnabled ? '(Showing ranked recommendations)' : '(Showing all rewards)'}
            </span>
          </div>

          {/* Refresh button (only works when AI is on) */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || !aiEnabled}
            style={{
              padding: '10px 20px',
              cursor: refreshing || !aiEnabled ? 'not-allowed' : 'pointer',
              backgroundColor: aiEnabled ? '#2196F3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {refreshing ? 'Refreshing...' : '🔄 Refresh Rankings'}
          </button>
        </div>
      </div>

      {/* Rewards List */}
      <div>
        <h2>{aiEnabled ? 'Recommended Rewards (Ranked)' : 'All Rewards'}</h2>
        
        {loading ? (
          <p>Loading rewards...</p>
        ) : rewards.length === 0 ? (
          <p>No rewards available yet.</p>
        ) : (
          <div>
            {rewards.map((reward, index) => (
              <div
                key={reward._id}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  backgroundColor: '#fff',
                  position: 'relative'
                }}
              >
                {/* Show rank number if AI is enabled */}
                {aiEnabled && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    #{index + 1}
                  </div>
                )}

                {/* Reward details */}
                <h3 style={{ margin: '0 0 10px 0' }}>{reward.name}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>{reward.description}</p>
                
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Type:</strong> {reward.type}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Points Required:</strong> {reward.pointsCost.toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Value:</strong> ${reward.value.toFixed(2)}
                  </p>
                  
                  {/* Show AI score if AI is enabled */}
                  {aiEnabled && reward.score !== undefined && (
                    <p style={{ margin: '5px 0', color: '#4CAF50', fontWeight: 'bold' }}>
                      AI Score: {reward.score.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
