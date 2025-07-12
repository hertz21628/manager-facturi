import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    outstandingBalance: 0,
    paidInvoices: 0,
    overdueInvoices: 0
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchClientData();
    }
  }, [currentUser]);

  const fetchClientData = async () => {
    try {
      // Fetch recent invoices for this client
      const invoicesRef = collection(db, 'invoices');
      const q = query(
        invoicesRef,
        where('clientEmail', '==', currentUser.email)
        // orderBy('date', 'desc'),
        // limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      const invoices = [];
      let totalOutstanding = 0;
      let paidCount = 0;
      let overdueCount = 0;

      querySnapshot.forEach((doc) => {
        const invoice = { id: doc.id, ...doc.data() };
        invoices.push(invoice);
        
        if (invoice.status === 'paid') {
          paidCount++;
        } else if (invoice.status === 'overdue') {
          overdueCount++;
          totalOutstanding += invoice.total || 0;
        } else if (invoice.status === 'pending') {
          totalOutstanding += invoice.total || 0;
        }
      });

      // Sort by date in JavaScript and limit to 5 most recent
      const sortedInvoices = invoices
        .sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        })
        .slice(0, 5);

      setRecentInvoices(sortedInvoices);
      setSummary({
        totalInvoices: invoices.length,
        outstandingBalance: totalOutstanding,
        paidInvoices: paidCount,
        overdueInvoices: overdueCount
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/client/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#28a745';
      case 'pending': return '#ffc107';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.toDate()).toLocaleDateString();
  };

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <div className="client-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <header className="client-header">
        <div className="client-header-content">
          <h1>Client Portal</h1>
          <div className="client-user-info">
            <span>Welcome, {currentUser?.email}</span>
            <ThemeSwitcher />
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="client-container">
        <nav className="client-nav">
          <Link to="/client/dashboard" className="nav-item active">
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </Link>
          <Link to="/client/invoices" className="nav-item">
            <i className="fas fa-file-invoice"></i>
            My Invoices
          </Link>
          <Link to="/client/payments" className="nav-item">
            <i className="fas fa-credit-card"></i>
            Payments
          </Link>
          <Link to="/client/profile" className="nav-item">
            <i className="fas fa-user"></i>
            Profile
          </Link>
        </nav>

        <main className="client-main">
          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>Total Invoices</h3>
              <p className="summary-number">{summary.totalInvoices}</p>
            </div>
            <div className="summary-card">
              <h3>Outstanding Balance</h3>
              <p className="summary-number outstanding">{formatCurrency(summary.outstandingBalance)}</p>
            </div>
            <div className="summary-card">
              <h3>Paid Invoices</h3>
              <p className="summary-number paid">{summary.paidInvoices}</p>
            </div>
            <div className="summary-card">
              <h3>Overdue Invoices</h3>
              <p className="summary-number overdue">{summary.overdueInvoices}</p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="recent-invoices">
              <div className="section-header">
                <h2>Recent Invoices</h2>
                <Link to="/client/invoices" className="view-all">View All</Link>
              </div>
              
              {recentInvoices.length === 0 ? (
                <div className="no-invoices">
                  <p>No invoices found.</p>
                </div>
              ) : (
                <div className="invoice-list">
                  {recentInvoices.map((invoice, index) => (
                    <div key={invoice.id} className="invoice-item">
                      <div className="invoice-info">
                        <h4>Invoice {index + 1}</h4>
                        <p className="invoice-date">
                          {new Date(invoice.date?.toDate()).toLocaleDateString()}
                        </p>
                        <p className="invoice-amount">{formatCurrency(invoice.total)}</p>
                      </div>
                      <div className="invoice-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(invoice.status) }}
                        >
                          {invoice.status}
                        </span>
                        <button 
                          className="action-btn view"
                          onClick={() => openModal(invoice)}
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <Link to="/client/invoices" className="action-btn">
                  <i className="fas fa-file-invoice"></i>
                  View All Invoices
                </Link>
                <Link to="/client/payments" className="action-btn">
                  <i className="fas fa-credit-card"></i>
                  Make Payment
                </Link>
                <Link to="/client/profile" className="action-btn">
                  <i className="fas fa-user-edit"></i>
                  Update Profile
                </Link>
                <Link to="/client/support" className="action-btn">
                  <i className="fas fa-headset"></i>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Invoice Modal */}
      {modalOpen && selectedInvoice && (
        <div className="invoice-modal-overlay" onClick={closeModal}>
          <div className="invoice-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2>Invoice #{selectedInvoice.invoiceNumber}</h2>
            <p><strong>Client:</strong> {selectedInvoice.clientName} ({selectedInvoice.clientEmail})</p>
            <p><strong>Date:</strong> {formatDate(selectedInvoice.date)}</p>
            <p><strong>Due Date:</strong> {formatDate(selectedInvoice.dueDate)}</p>
            <p><strong>Status:</strong> <span style={{ backgroundColor: getStatusColor(selectedInvoice.status), color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>{selectedInvoice.status}</span></p>
            <p><strong>Currency:</strong> {selectedInvoice.currency}</p>
            <h3>Line Items</h3>
            <ul style={{ paddingLeft: 0 }}>
              {selectedInvoice.lineItems && selectedInvoice.lineItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '8px', listStyle: 'none', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  <strong>{item.description}</strong> — Qty: {item.quantity}, Price: {formatCurrency(item.price)}, Tax: {item.tax}%
                </li>
              ))}
            </ul>
            <p><strong>Subtotal:</strong> {formatCurrency(selectedInvoice.subtotal)}</p>
            <p><strong>Tax:</strong> {formatCurrency(selectedInvoice.totalTax)}</p>
            <p><strong>Discount:</strong> {formatCurrency(selectedInvoice.discount)}</p>
            <p><strong>Total:</strong> <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{formatCurrency(selectedInvoice.total)}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard; 