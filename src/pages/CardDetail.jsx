import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Merchant list with categories
const merchantsData = [
  { name: 'Whole Foods', category: 'Groceries' },
  { name: 'Kroger', category: 'Groceries' },
  { name: 'Walmart', category: 'Groceries' },
  { name: 'Target', category: 'Groceries' },
  { name: 'Chipotle', category: 'Dining' },
  { name: 'Starbucks', category: 'Dining' },
  { name: "McDonald's", category: 'Dining' },
  { name: 'Shell Gas', category: 'Gas' },
  { name: 'BP', category: 'Gas' },
  { name: 'Chevron', category: 'Gas' },
  { name: 'Amazon', category: 'Shopping' },
  { name: 'Best Buy', category: 'Shopping' },
  { name: 'Apple Store', category: 'Shopping' },
  { name: 'Netflix', category: 'Entertainment' },
  { name: 'Spotify', category: 'Entertainment' },
  { name: 'Delta Airlines', category: 'Travel' },
  { name: 'Uber', category: 'Travel' },
  { name: 'Lyft', category: 'Travel' },
  { name: 'AT&T', category: 'Bills' },
  { name: 'Verizon', category: 'Bills' }
];

export default function CardDetail() {
  const { cardId } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    merchant: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCardAndTransactions();
  }, [cardId]);

  const fetchCardAndTransactions = async () => {
    try {
      const cardResponse = await fetch(`${API_URL}/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` }
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

      const txResponse = await fetch(`${API_URL}/cards/${cardId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txData = await txResponse.json();
      if (!txResponse.ok) throw new Error(txData.message || 'Failed to fetch transactions');
      setTransactions(txData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTransaction)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add transaction');
      await fetchCardAndTransactions();
      setNewTransaction({ merchant: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete transaction');
      }
      await fetchCardAndTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL transactions for this card?')) return;
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/transactions/deleteAll`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) setTransactions([]);
      else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete transactions');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!card)
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
            ← Back to Dashboard
          </button>
          <button onClick={() => navigate(`/cards/${cardId}/rewards`)} style={styles.viewRewardsButton}>
            View Rewards
          </button>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {/* Card Header */}
        <div style={styles.cardHeaderBox}>
          <div>
            <h1 style={styles.cardTitle}>{card.cardName}</h1>
            <p style={styles.cardNumber}>•••• {card.lastFourDigits}</p>
          </div>
          <span style={styles.issuerBadge}>{card.issuer}</span>
        </div>

        {/* Add Transaction Form */}
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Add Transaction</h2>
          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleAddTransaction} style={styles.form}>
            <select
              value={newTransaction.merchant}
              onChange={(e) => {
                const selectedMerchant = merchantsData.find((m) => m.name === e.target.value);
                setNewTransaction({
                  ...newTransaction,
                  merchant: selectedMerchant.name,
                  category: selectedMerchant.category
                });
              }}
              required
              style={styles.select}
            >
              <option value="">Select Merchant</option>
              {merchantsData.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount"
              step="0.01"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              required
              style={styles.input}
            />

            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              required
              style={styles.input}
            />

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.addButton, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div style={styles.transactionsCard}>
          <div style={styles.transactionsHeader}>
            <h2 style={styles.sectionTitle}>Transactions</h2>
            {transactions.length > 0 && (
              <button onClick={handleDeleteAll} style={styles.deleteAllButton}>
                Delete All
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No transactions yet. Add your first transaction above!</p>
            </div>
          ) : (
            <div style={styles.transactionsList}>
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  style={styles.transactionItem}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#4B5563')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#374151')}
                >
                  <div style={styles.transactionInfo}>
                    <h3 style={styles.merchantName}>{tx.merchant}</h3>
                    <p style={styles.transactionMeta}>
                      {tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={styles.transactionActions}>
                    <span style={styles.amount}>${parseFloat(tx.amount).toFixed(2)}</span>
                    <button onClick={() => handleDeleteTransaction(tx._id)} style={styles.deleteButton}>
                      Delete
                    </button>
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

// ---------- Styles Object (unchanged from original)
const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#1F2A3A',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: 0,
    padding: 0,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto'
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#1F2A3A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: { color: '#9CA3AF', fontSize: '16px' },
  header: { background: '#243447', borderBottom: '1px solid #374151', padding: '16px 0' },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '14px', cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit' },
  viewRewardsButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '700',
    background: '#C9A84E',
    color: '#1F2A3A',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  contentWrapper: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  cardHeaderBox: {
    background: '#243447',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
  },
  cardTitle: { fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px 0' },
  cardNumber: { color: '#9CA3AF', fontSize: '15px', margin: 0 },
  issuerBadge: { fontSize: '12px', fontWeight: '600', color: '#C9A84E', background: 'rgba(201, 168, 78, 0.1)', padding: '8px 16px', borderRadius: '20px' },
  formCard: { background: '#243447', borderRadius: '12px', padding: '24px', marginBottom: '32px', border: '1px solid #374151', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 24px 0' },
  error: { background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#FCA5A5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  input: { padding: '12px 16px', fontSize: '15px', background: '#1F2A3A', border: '1px solid #374151', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontFamily: 'inherit' },
  select: { padding: '12px 16px', fontSize: '15px', background: '#1F2A3A', border: '1px solid #374151', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' },
  addButton: { padding: '12px 16px', fontSize: '15px', fontWeight: '700', background: '#C9A84E', color: '#1F2A3A', border: 'none', borderRadius: '8px', transition: 'all 0.2s', fontFamily: 'inherit' },
  transactionsCard: { background: '#243447', borderRadius: '12px', padding: '24px', border: '1px solid #374151', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)' },
  transactionsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  deleteAllButton: { background: 'transparent', border: 'none', color: '#F87171', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  emptyState: { textAlign: 'center', padding: '48px 24px' },
  emptyText: { color: '#9CA3AF', fontSize: '15px', margin: 0 },
  transactionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  transactionItem: { background: '#1F2A3A', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #374151', transition: 'border-color 0.2s' },
  transactionInfo: { flex: 1 },
  merchantName: { fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px 0' },
  transactionMeta: { fontSize: '13px', color: '#9CA3AF', margin: 0 },
  transactionActions: { display: 'flex', alignItems: 'center', gap: '16px' },
  amount: { fontSize: '18px', fontWeight: '700', color: '#FFFFFF' },
  deleteButton: { background: 'transparent', border: 'none', color: '#F87171', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  loadingContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#9CA3AF', fontSize: '16px' }
};



