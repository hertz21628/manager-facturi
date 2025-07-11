import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from 'firebase/firestore';
import './Dashboard.css';

const defaultLine = { description: '', quantity: 1, price: 0, tax: 0 };
const currencySymbols = { USD: '$', EUR: '€', RON: 'lei', GBP: '£' };

const recurringFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const InvoiceCreation = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [lineItems, setLineItems] = useState([ { ...defaultLine } ]);
  const [discount, setDiscount] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [recurringStart, setRecurringStart] = useState('');
  const [recurringEnd, setRecurringEnd] = useState('');
  const [recurringOccurrences, setRecurringOccurrences] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const q = query(collection(db, 'clients'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalTax = lineItems.reduce((sum, item) => sum + (item.quantity * item.price * (item.tax/100)), 0);
  const total = subtotal + totalTax - Number(discount || 0);

  const handleLineChange = (idx, field, value) => {
    setLineItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addLine = () => setLineItems([...lineItems, { ...defaultLine }]);
  const removeLine = idx => setLineItems(items => items.length > 1 ? items.filter((_, i) => i !== idx) : items);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setError('Please select a client for this invoice.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const selectedClientData = clients.find(c => c.id === selectedClient);
      await addDoc(collection(db, 'invoices'), {
        clientId: selectedClient,
        clientName: selectedClientData?.name || '',
        clientEmail: selectedClientData?.email || '',
        lineItems,
        subtotal,
        totalTax,
        discount: Number(discount),
        total,
        paymentTerms,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        createdAt: Timestamp.now(),
        currency,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        recurringStart: isRecurring && recurringStart ? Timestamp.fromDate(new Date(recurringStart)) : null,
        recurringEnd: isRecurring && recurringEnd ? Timestamp.fromDate(new Date(recurringEnd)) : null,
        recurringOccurrences: isRecurring && recurringOccurrences ? Number(recurringOccurrences) : null,
        status: 'pending'
      });
      setSuccess('Invoice saved successfully!');
      setSelectedClient('');
      setLineItems([ { ...defaultLine } ]);
      setDiscount(0);
      setPaymentTerms('Net 30');
      setDueDate('');
      setCurrency('USD');
      setIsRecurring(false);
      setRecurringFrequency('monthly');
      setRecurringStart('');
      setRecurringEnd('');
      setRecurringOccurrences('');
    } catch (err) {
      setError('Failed to save invoice.');
    }
    setSaving(false);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>InvoiceApp</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/clients" className="nav-link">Clients</Link>
          <Link to="/invoices" className="nav-link">Invoices</Link>
          <Link to="/reports" className="nav-link">Reports</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="main-header">
          <h1>Create New Invoice</h1>
          <p>Add line items, set payment terms, and create professional invoices for your clients.</p>
        </header>

        <div className="feature-card" style={{ maxWidth: 'none' }}>
          {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}
          {success && <div style={{ padding: '10px', background: '#e8f5e8', color: '#2e7d32', borderRadius: '5px', marginBottom: '20px' }}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '20px', color: '#6a11cb' }}>Invoice Details</h3>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Select Client:
              </label>
              <select 
                value={selectedClient} 
                onChange={e => setSelectedClient(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                <option value="">-- Select a client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#333' }}>Line Items</h4>
              {lineItems.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 80px 100px 100px 40px', 
                  gap: '10px', 
                  marginBottom: '10px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => handleLineChange(idx, 'description', e.target.value)}
                    required
                    style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleLineChange(idx, 'quantity', Number(e.target.value))}
                    required
                    style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={item.price}
                    onChange={e => handleLineChange(idx, 'price', Number(e.target.value))}
                    required
                    style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Tax %"
                    value={item.tax}
                    onChange={e => handleLineChange(idx, 'tax', Number(e.target.value))}
                    required
                    style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeLine(idx)} 
                    disabled={lineItems.length === 1}
                    style={{ 
                      padding: '10px', 
                      background: '#ff4757', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 100px 40px', gap: '10px', marginBottom: '10px', alignItems: 'center', fontSize: 13, color: '#888' }}>
                <div></div>
                <div><strong>Quantity</strong><br />Number of units/items</div>
                <div><strong>Price</strong><br />Unit price for each item</div>
                <div><strong>Tax %</strong><br />Tax rate for this line</div>
                <div></div>
              </div>
              <button 
                type="button" 
                onClick={addLine} 
                style={{ 
                  padding: '10px 20px', 
                  background: '#6a11cb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                + Add Line Item
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Discount ($):
                </label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={discount} 
                  onChange={e => setDiscount(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    fontSize: '14px'
                  }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Payment Terms:
                </label>
                <select 
                  value={paymentTerms} 
                  onChange={e => setPaymentTerms(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Net 7">Net 7</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Due Date:
              </label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Currency:
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                style={{
                  width: '200px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  marginBottom: '10px',
                }}
              >
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="RON">Romanian Leu (lei)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Recurring Invoice
              </label>
              {isRecurring && (
                <div style={{ marginTop: 10, paddingLeft: 8 }}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>Frequency:</label>
                    <select
                      value={recurringFrequency}
                      onChange={e => setRecurringFrequency(e.target.value)}
                      style={{ padding: '8px', borderRadius: 5, border: '1px solid #ddd', fontSize: 14 }}
                    >
                      {recurringFrequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>Start Date:</label>
                    <input
                      type="date"
                      value={recurringStart}
                      onChange={e => setRecurringStart(e.target.value)}
                      style={{ padding: '8px', borderRadius: 5, border: '1px solid #ddd', fontSize: 14 }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>End Date (optional):</label>
                    <input
                      type="date"
                      value={recurringEnd}
                      onChange={e => setRecurringEnd(e.target.value)}
                      style={{ padding: '8px', borderRadius: 5, border: '1px solid #ddd', fontSize: 14 }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontWeight: 500, marginRight: 8 }}>Occurrences (optional):</label>
                    <input
                      type="number"
                      min="1"
                      value={recurringOccurrences}
                      onChange={e => setRecurringOccurrences(e.target.value)}
                      style={{ padding: '8px', borderRadius: 5, border: '1px solid #ddd', fontSize: 14, width: 100 }}
                    />
                  </div>
                  <div style={{ color: '#888', fontSize: 13 }}>
                    <p>Recurring invoices will be automatically generated based on the selected frequency, starting from the start date. You can set either an end date or a number of occurrences (or both).</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '30px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#333' }}>Invoice Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>Subtotal: <span style={{ fontWeight: '600' }}>{currencySymbols[currency]}{subtotal.toFixed(2)}</span></div>
                <div>Tax: <span style={{ fontWeight: '600' }}>{currencySymbols[currency]}{totalTax.toFixed(2)}</span></div>
                <div>Discount: <span style={{ fontWeight: '600' }}>{currencySymbols[currency]}{Number(discount).toFixed(2)}</span></div>
                <div style={{ fontSize: '1.2em', fontWeight: '700', color: '#6a11cb' }}>
                  Total: {currencySymbols[currency]}{total.toFixed(2)}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving} 
              style={{ 
                padding: '12px 30px', 
                fontSize: '16px',
                background: '#6a11cb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {saving ? 'Saving...' : 'Save Invoice'}
            </button>
            
            {success && (
              <div style={{ 
                color: '#28a745', 
                marginTop: '15px', 
                padding: '10px', 
                background: '#d4edda', 
                border: '1px solid #c3e6cb', 
                borderRadius: '5px' 
              }}>
                {success}
              </div>
            )}
            {error && (
              <div style={{ 
                color: '#dc3545', 
                marginTop: '15px', 
                padding: '10px', 
                background: '#f8d7da', 
                border: '1px solid #f5c6cb', 
                borderRadius: '5px' 
              }}>
                {error}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default InvoiceCreation; 