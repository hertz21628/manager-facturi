import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientDashboard.css';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ro', label: 'Romanian' },
  { code: 'de', label: 'German' },
];

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
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchClientData();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language]);

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
      const outstandingByCurrency = {};
      let paidCount = 0;
      let overdueCount = 0;

      querySnapshot.forEach((doc) => {
        const invoice = { id: doc.id, ...doc.data() };
        invoices.push(invoice);
        
        if (invoice.status === 'paid') {
          paidCount++;
        } else if (invoice.status === 'overdue' || invoice.status === 'pending') {
          if (invoice.status === 'overdue') {
            overdueCount++;
          }
          
          // Group outstanding amounts by currency
          const currency = invoice.currency || 'USD';
          const amount = invoice.total || 0;
          
          if (!outstandingByCurrency[currency]) {
            outstandingByCurrency[currency] = 0;
          }
          outstandingByCurrency[currency] += amount;
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
        outstandingBalance: outstandingByCurrency,
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
      case 'completed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatCurrencyAmount = (amount, currencyCode = 'USD') => {
    return formatCurrency(amount || 0, currencyCode);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      // Handle Firestore Timestamp
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      
      // Handle regular Date object
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      
      // Handle string or timestamp
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'N/A';
    }
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
        <div className="loading">{t('Loading...')}</div>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <header className="client-header">
        <div className="client-header-content">
          <h1>{t('Client Portal')}</h1>
          <div className="client-user-info">
            <span>{t('Welcome')}, {currentUser?.email}</span>
            <ThemeSwitcher />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-selector"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {t(l.label)}
                </option>
              ))}
            </select>
            <button onClick={handleLogout} className="logout-btn">{t('Logout')}</button>
          </div>
        </div>
      </header>

      <div className="client-container">
        <nav className="client-nav">
          <Link to="/client/dashboard" className="nav-item active">
            <i className="fas fa-tachometer-alt"></i>
            {t('Dashboard')}
          </Link>
          <Link to="/client/invoices" className="nav-item">
            <i className="fas fa-file-invoice"></i>
            {t('My Invoices')}
          </Link>
          <Link to="/client/payments" className="nav-item">
            <i className="fas fa-credit-card"></i>
            {t('Payments')}
          </Link>
          <Link to="/client/profile" className="nav-item">
            <i className="fas fa-user"></i>
            {t('Profile')}
          </Link>
        </nav>

        <main className="client-main">
          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>{t('Total Invoices')}</h3>
              <p className="summary-number">{summary.totalInvoices}</p>
            </div>
            <div className="summary-card">
              <h3>{t('Outstanding Balance')}</h3>
              <div className="summary-number outstanding">
                {typeof summary.outstandingBalance === 'object' ? (
                  Object.entries(summary.outstandingBalance).map(([currency, amount]) => (
                    <div key={currency} style={{ marginBottom: '4px' }}>
                      {formatCurrencyAmount(amount, currency)}
                    </div>
                  ))
                ) : (
                  formatCurrencyAmount(summary.outstandingBalance)
                )}
              </div>
            </div>
            <div className="summary-card">
              <h3>{t('Paid Invoices')}</h3>
              <p className="summary-number paid">{summary.paidInvoices}</p>
            </div>
            <div className="summary-card">
              <h3>{t('Overdue Invoices')}</h3>
              <p className="summary-number overdue">{summary.overdueInvoices}</p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="recent-invoices">
              <div className="section-header">
                <h2>{t('Recent Invoices')}</h2>
                <Link to="/client/invoices" className="view-all">{t('View All')}</Link>
              </div>
              
              {recentInvoices.length === 0 ? (
                <div className="no-invoices">
                  <p>{t('No invoices found.')}</p>
                </div>
              ) : (
                <div className="invoice-list">
                  {recentInvoices.map((invoice, index) => (
                    <div key={invoice.id} className="invoice-item">
                      <div className="invoice-info">
                        <h4>{t('Invoice')} INV-{invoice.id.slice(-8).toUpperCase()}</h4>
                        <p className="invoice-date">
                          {formatDate(invoice.paidAt || invoice.date)}
                        </p>
                        <p className="invoice-amount">{formatCurrencyAmount(invoice.total, invoice.currency)}</p>
                      </div>
                      <div className="invoice-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(invoice.status) }}
                        >
                          {t(invoice.status)}
                        </span>
                        <button 
                          className="action-btn view"
                          onClick={() => openModal(invoice)}
                        >
                          <i className="fas fa-eye"></i>
                          {t('View')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="quick-actions">
              <h2>{t('Quick Actions')}</h2>
              <div className="action-buttons">
                <Link to="/client/invoices" className="action-btn">
                  <i className="fas fa-file-invoice"></i>
                  {t('View All Invoices')}
                </Link>
                <Link to="/client/payments" className="action-btn">
                  <i className="fas fa-credit-card"></i>
                  {t('Make Payment')}
                </Link>
                <Link to="/client/profile" className="action-btn">
                  <i className="fas fa-user-edit"></i>
                  {t('Update Profile')}
                </Link>
                <Link to="/client/support" className="action-btn">
                  <i className="fas fa-headset"></i>
                  {t('Contact Support')}
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
            <h2>{t('Invoice')} INV-{selectedInvoice.id.slice(-8).toUpperCase()}</h2>
            <p><strong>{t('Client')}:</strong> {selectedInvoice.clientName} ({selectedInvoice.clientEmail})</p>
            <p><strong>{t('Date')}:</strong> {formatDate(selectedInvoice.paidAt || selectedInvoice.date)}</p>
            <p><strong>{t('Due Date')}:</strong> {formatDate(selectedInvoice.dueDate)}</p>
            <p><strong>{t('Status')}:</strong> <span style={{ backgroundColor: getStatusColor(selectedInvoice.status), color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>{t(selectedInvoice.status)}</span></p>
            <p><strong>{t('Currency')}:</strong> {selectedInvoice.currency}</p>
            <h3>{t('Line Items')}</h3>
            <ul style={{ paddingLeft: 0 }}>
              {selectedInvoice.lineItems && selectedInvoice.lineItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '8px', listStyle: 'none', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  <strong>{item.description}</strong> — {t('Qty')}: {item.quantity}, {t('Price')}: {formatCurrencyAmount(item.price, selectedInvoice.currency)}, {t('Tax')}: {item.tax}%
                </li>
              ))}
            </ul>
                          <p><strong>{t('Subtotal')}:</strong> {formatCurrencyAmount(selectedInvoice.subtotal, selectedInvoice.currency)}</p>
              <p><strong>{t('Tax')}:</strong> {formatCurrencyAmount(selectedInvoice.totalTax, selectedInvoice.currency)}</p>
              <p><strong>{t('Discount')}:</strong> {formatCurrencyAmount(selectedInvoice.discount, selectedInvoice.currency)}</p>
              <p><strong>{t('Total')}:</strong> <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{formatCurrencyAmount(selectedInvoice.total, selectedInvoice.currency)}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard; 