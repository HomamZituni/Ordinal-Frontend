import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function CardDetail() {
  const { cardId } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [card, setCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  const [newTransaction, setNewTransaction] = useState({
    merchant: '',
    amount: '',
    category: 'Dining',
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

      const txResponse = await fetch(`${API_URL}/cards/${cardId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const txData = await txResponse.json();

      if (!txResponse.ok) {
        throw new Error(txData.message || 'Failed to fetch transactions');
      }

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTransaction)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add transaction');
      }

      await fetchCardAndTransactions();
      
      setNewTransaction({
        merchant: '',
        amount: '',
        category: 'Dining',
        date: new Date().toISOString().split('T')[0]
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    if (!confirm('Are you sure you want to delete ALL transactions for this card?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/transactions/deleteAll`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTransactions([]);
        alert('All transactions deleted!');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete transactions');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!card) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 15px', cursor: 'pointer', marginBottom: '15px' }}
        >
          ← Back to Dashboard
        </button>
        <h1>{card.cardName}</h1>
        <p style={{ color: '#666' }}>{card.issuer} •••• {card.lastFourDigits}</p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Add Transaction</h2>
        <form onSubmit={handleAddTransaction}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Merchant:</label>
              <input
                type="text"
                value={newTransaction.merchant}
                onChange={(e) => setNewTransaction({ ...newTransaction, merchant: e.target.value })}
                placeholder="e.g., Starbucks"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Amount ($):</label>
              <input
                type="number"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="0.00"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Category:</label>
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="Dining">Dining</option>
                <option value="Travel">Travel</option>
                <option value="Groceries">Groceries</option>
                <option value="Gas">Gas</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label>Date:</label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', marginTop: '15px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Transactions</h2>
          {transactions.length > 0 && (
            <button
              onClick={handleDeleteAll}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete All Transactions
            </button>
          )}
        </div>
        
        {transactions.length === 0 ? (
          <p>No transactions yet. Add your first transaction above!</p>
        ) : (
          <div>
            {transactions.map((tx) => (
              <div
                key={tx._id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{tx.merchant}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      {tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                      ${tx.amount.toFixed(2)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTransaction(tx._id)}
                    style={{ 
                      padding: '8px 15px', 
                      cursor: 'pointer', 
                      backgroundColor: '#ff4444', 
                      color: 'white', 
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    Delete
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
