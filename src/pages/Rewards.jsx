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
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCardAndRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, aiEnabled]);

  const fetchCardAndRewards = async () => {
    console.log('fetchCardAndRewards called, aiEnabled:', aiEnabled);
    setLoading(true);
    setError('');

    try {
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

      let rewardsUrl = aiEnabled 
        ? `${API_URL}/cards/${cardId}/rewards/ranked`
        : `${API_URL}/cards/${cardId}/rewards`;

      console.log('Fetching rewards from:', rewardsUrl);

      const rewardsResponse = await fetch(rewardsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!rewardsResponse.ok) {
        if (aiEnabled && rewardsResponse.status === 404) {
          console.warn('AI-ranked rewards not available, falling back to normal rewards');
          rewardsUrl = `${API_URL}/cards/${cardId}/rewards`;
          const fallbackResponse = await fetch(rewardsUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!fallbackResponse.ok) throw new Error('Failed to fetch rewards');
          const fallbackData = await fallbackResponse.json();
          setRewards(fallbackData);
          setAiEnabled(false);
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

  const handleToggleAI = () => setAiEnabled(!aiEnabled);

  if (loading && !card) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>
          <h1 style={styles.pageTitle}>Rewards Dashboard</h1>
          {card && (
            <p style={styles.cardInfo}>
              {card.cardName} • {card.issuer} •••• {card.lastFourDigits}
            </p>
          )}
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Controls Panel */}
        <div style={styles.controlPanel}>
          <div style={styles.controlLeft}>
            <label style={styles.controlLabel}>AI Ranking</label>
            <button
              onClick={handleToggleAI}
              style={{
                ...styles.toggleButton,
                backgroundColor: aiEnabled ? '#C9A84E' : '#4B5563'
              }}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </button>
            <span style={styles.controlSubtext}>
              {aiEnabled ? 'Personalized recommendations' : 'Standard list view'}
            </span>
          </div>
          {/* Refresh Rankings button removed */}
        </div>

        {/* Rewards Section */}
        <div style={styles.rewardsSection}>
          <h2 style={styles.sectionTitle}>
            {aiEnabled ? 'Recommended Rewards' : 'All Available Rewards'}
          </h2>

          {loading ? (
            <p style={styles.emptyText}>Loading...</p>
          ) : rewards.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No rewards found. Add transactions to see rankings.</p>
            </div>
          ) : (
            <div style={styles.rewardsGrid}>
              {rewards.map((reward, index) => (
                <div key={reward._id} style={styles.rewardCard}>
                  {aiEnabled && reward.nbaScore !== undefined && (
                    <div style={styles.rankBadge}>
                      #{index + 1}
                    </div>
                  )}

                  <h3 style={styles.rewardTitle}>{reward.title}</h3>
                  <p style={styles.rewardDescription}>{reward.description}</p>

                  <div style={styles.rewardDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Category</span>
                      <span style={styles.detailValue}>{reward.category}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Points Cost</span>
                      <span style={styles.detailValue}>{reward.pointsCost.toLocaleString()}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Value</span>
                      <span style={styles.detailValue}>${reward.value.toFixed(2)}</span>
                    </div>
                    {aiEnabled && reward.reason && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Reason</span>
                        <span style={styles.detailValue}>{reward.reason}</span>
                      </div>
                    )}

                    {/*
                    {aiEnabled && reward.nbaScore !== undefined && (
                      <div style={styles.scoreRow}>
                        <span style={styles.scoreLabel}>NBA Score</span>
                        <span style={styles.scoreValue}>{reward.nbaScore.toFixed(2)}</span>
                      </div>
                    )}
                    */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#1F2A3A',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#1F2A3A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: '16px'
  },
  header: {
    background: '#243447',
    borderBottom: '1px solid #374151',
    padding: '24px 0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px',
    fontFamily: 'inherit'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 8px 0'
  },
  cardInfo: {
    fontSize: '14px',
    color: '#9CA3AF',
    margin: 0
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  error: {
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    color: '#FCA5A5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  controlPanel: {
    background: '#243447',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  controlLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  controlLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF'
  },
  toggleButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '6px',
    color: '#1F2A3A',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  controlSubtext: {
    fontSize: '13px',
    color: '#9CA3AF'
  },
  rewardsSection: {
    marginTop: '8px'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 24px 0'
  },
  emptyState: {
    background: '#243447',
    borderRadius: '12px',
    padding: '60px 24px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: '15px',
    margin: 0
  },
  rewardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px'
  },
  rewardCard: {
    background: '#243447',
    borderRadius: '12px',
    padding: '24px',
    position: 'relative',
    border: '1px solid #374151',
    transition: 'border-color 0.2s',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  rankBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: '#C9A84E',
    color: '#1F2A3A',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px'
  },
  rewardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 12px 0',
    paddingRight: '60px'
  },
  rewardDescription: {
    fontSize: '14px',
    color: '#9CA3AF',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },
  rewardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: '13px',
    color: '#9CA3AF'
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF'
  },
  detailValueGold: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#C9A84E'
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #374151'
  },
  scoreLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#C9A84E'
  },
  scoreValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#C9A84E'
  }
};


