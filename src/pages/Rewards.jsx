import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Rewards() {
  const { cardId } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [card, setCard] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCardAndRewards();
  }, [cardId, aiEnabled]);

  const fetchCardAndRewards = async () => {
    console.log('fetchCardAndRewards called, aiEnabled:', aiEnabled);
    setLoading(true);
    setError('');

    try {
      // Fetch card details
      const cardResponse = await fetch(`${API_URL}/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!cardResponse.ok) {
        const data = await cardResponse.json().catch(() => ({}));
        if (cardResponse.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(data.message || 'Failed to fetch card');
      }

      const cardData = await cardResponse.json();
      setCard(cardData);

      // Decide which rewards URL to use
      let rewardsUrl = aiEnabled 
        ? `${API_URL}/cards/${cardId}/rewards/ranked`
        : `${API_URL}/cards/${cardId}/rewards`;

      console.log('Fetching rewards from:', rewardsUrl);

      const rewardsResponse = await fetch(rewardsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!rewardsResponse.ok) {
        // Fallback if /ranked doesn’t exist
        if (aiEnabled && rewardsResponse.status === 404) {
          console.warn('AI-ranked rewards not available, falling back to normal rewards');
          rewardsUrl = `${API_URL}/cards/${cardId}/rewards`;
          const fallbackResponse = await fetch(rewardsUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!fallbackResponse.ok) throw new Error('Failed to fetch rewards');
          const fallbackData = await fallbackResponse.json();
          setRewards(fallbackData);
          setAiEnabled(false); // automatically disable AI since ranked not available
          return;
        }

        const data = await rewardsResponse.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch rewards');
      }

      const rewardsData = await rewardsResponse.json();
      setRewards(aiEnabled ? rewardsData.rewards || [] : rewardsData);

    } catch (err) {
      console.error('Error in fetchCardAndRewards:', err);
      setError(err.message);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!aiEnabled) {
      alert('Enable AI ranking to refresh recommendations');
      return;
    }

    setRefreshing(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/rewards/ranked`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to refresh rankings');

      const data = await response.json();
      setRewards(data.rewards || []);
      alert('Rankings refreshed successfully!');
    } catch (err) {
      console.error('Error in handleRefresh:', err);
      alert('Failed to refresh rankings. AI-ranked rewards may not be available yet.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleAI = () => setAiEnabled(!aiEnabled);

  if (loading && !card) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 15px', cursor: 'pointer', marginBottom: '15px' }}>
          ← Back to Dashboard
        </button>
        <h1>Rewards</h1>
        {card && <p style={{ color: '#666' }}>{card.cardName} • {card.issuer} •••• {card.lastFourDigits}</p>}
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              {aiEnabled ? '(NBA rankings based on your spending)' : '(Showing all rewards)'}
            </span>
          </div>

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

      <div>
        <h2>{aiEnabled ? 'Recommended Rewards (NBA Ranked)' : 'All Available Rewards'}</h2>

        {loading ? (
          <p>Loading...</p>
        ) : rewards.length === 0 ? (
          <p>No rewards found. Add transactions to see rankings.</p>
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
                {aiEnabled && reward.nbaScore !== undefined && (
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

                <h3 style={{ margin: '0 0 10px 0' }}>{reward.title}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>{reward.description}</p>

                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0' }}><strong>Category:</strong> {reward.category}</p>
                  <p style={{ margin: '5px 0' }}><strong>Points Cost:</strong> {reward.pointsCost.toLocaleString()}</p>
                  <p style={{ margin: '5px 0' }}><strong>Value:</strong> ${reward.value.toFixed(2)}</p>
                  <p style={{ margin: '5px 0' }}><strong>Tier:</strong> {reward.tier}</p>

                  {aiEnabled && reward.nbaScore !== undefined && (
                    <p style={{ margin: '10px 0 0 0', color: '#4CAF50', fontWeight: 'bold', fontSize: '16px' }}>
                      NBA Score: {reward.nbaScore.toFixed(2)}
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
