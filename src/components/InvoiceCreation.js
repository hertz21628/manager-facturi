import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import './Dashboard.css';

const defaultLine = { description: '', quantity: 1, price: 0, tax: 0 };

const InvoiceCreation = () => {
  const navigate = useNavigate();
  const [lineItems, setLineItems] = useState([ { ...defaultLine } ]);
  const [discount, setDiscount] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
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
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await addDoc(collection(db, 'invoices'), {
        lineItems,
        subtotal,
        totalTax,
        discount: Number(discount),
        total,
        paymentTerms,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        createdAt: Timestamp.now(),
      });
      setSuccess('Invoice saved successfully!');
      setLineItems([ { ...defaultLine } ]);
      setDiscount(0);
      setPaymentTerms('Net 30');
      setDueDate('');
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
          <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
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
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '20px', color: '#6a11cb' }}>Invoice Details</h3>
            
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

            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '30px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#333' }}>Invoice Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>Subtotal: <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span></div>
                <div>Tax: <span style={{ fontWeight: '600' }}>${totalTax.toFixed(2)}</span></div>
                <div>Discount: <span style={{ fontWeight: '600' }}>${Number(discount).toFixed(2)}</span></div>
                <div style={{ fontSize: '1.2em', fontWeight: '700', color: '#6a11cb' }}>
                  Total: ${total.toFixed(2)}
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