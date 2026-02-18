import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ name: '', last4: '', network: 'Visa' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;
  {/*const [gamification, setGamification] = useState(null);*/}

  useEffect(() => {
    fetchCards();
    {/*fetchGamification();*/}
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
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

  /* const fetchGamification = async () => {
    try {
      const response = await fetch(`${API_URL}/cards/gamification`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setGamification(data);
    } catch (err) {
      console.log('Gamification not available');
    }
  }; */

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cardName: newCard.name,
          issuer: newCard.network,
          cardType: newCard.network,
          lastFourDigits: newCard.last4
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create card');
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

  const handleDeleteCard = async (cardId, cardName) => {
    if (!confirm(`Are you sure you want to delete ${cardName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete card');
      }

      await fetchCards();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Ordinal</h1>
          <div style={styles.headerRight}>
            <span style={styles.welcomeText}>
              Welcome, <span style={styles.username}>{user?.username}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/*  proper content wrapper for layout symmetry */}
      <div style={styles.contentWrapper}>
        {/* Add Card Form */}
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Add New Card</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleCreateCard} style={styles.form}>
            <input
              type="text"
              placeholder="Card Name"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Last 4 digits"
              value={newCard.last4}
              onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
              maxLength="4"
              required
              style={styles.input}
            />
            <select
              value={newCard.network}
              onChange={(e) => setNewCard({ ...newCard, network: e.target.value })}
              style={styles.select}
            >
              <option>Visa</option>
              <option>Mastercard</option>
              <option>Amex</option>
              <option>Discover</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.addButton,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : 'Add Card'}
            </button>
          </form>
        </div>

        {/* Cards Grid */}
        <div>
          <h2 style={styles.sectionTitle}>Your Cards</h2>
          {cards.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No cards yet. Add your first card above!</p>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {cards.map((card) => (
                <div
                  key={card._id}
                  style={styles.cardItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C9A84E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  <div
                    onClick={() => handleCardClick(card._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardName}>{card.cardName}</h3>
                      <span style={styles.issuerBadge}>{card.issuer}</span>
                    </div>
                    <p style={styles.cardNumber}>•••• {card.lastFourDigits}</p>
                    <p style={styles.cardHint}>Click to view details</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card._id, card.cardName);
                    }}
                    style={styles.deleteCardButton}
                  >
                    Delete Card
                  </button>
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
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: 0,
    padding: 0,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  header: {
    background: '#243447',
    borderBottom: '1px solid #374151',
    padding: '16px 0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#C9A84E',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  welcomeText: {
    color: '#D1D5DB',
    fontSize: '14px'
  },
  username: {
    fontWeight: '600',
    color: '#FFFFFF'
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.2s'
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  formCard: {
    background: '#243447',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid #374151',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  sectionTitle: {
    fontSize: '20px',
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
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    background: '#1F2A3A',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px 16px',
    fontSize: '15px',
    background: '#1F2A3A',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer'
  },
  addButton: {
    padding: '12px 16px',
    fontSize: '15px',
    fontWeight: '700',
    background: '#C9A84E',
    color: '#1F2A3A',
    border: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  emptyState: {
    background: '#243447',
    borderRadius: '12px',
    padding: '48px 24px',
    textAlign: 'center',
    border: '1px solid #374151',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: '15px',
    margin: 0
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  cardItem: {
    background: '#243447',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #374151',
    transition: 'border-color 0.2s',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  cardName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0,
    flex: 1
  },
  issuerBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#C9A84E',
    background: 'rgba(201, 168, 78, 0.1)',
    padding: '4px 12px',
    borderRadius: '12px'
  },
  cardNumber: {
    color: '#9CA3AF',
    fontSize: '14px',
    margin: '0 0 8px 0'
  },
  cardHint: {
    color: '#6B7280',
    fontSize: '12px',
    margin: 0
  },
  deleteCardButton: {
    marginTop: '12px',
    width: '100%',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '600',
    background: 'transparent',
    color: '#F87171',
    border: '1px solid #F87171',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s'
  }
};








