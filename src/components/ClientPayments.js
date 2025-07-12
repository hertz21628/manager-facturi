import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientPayments.css';
import { useTranslation } from 'react-i18next';

const ClientPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      // Fetch invoices for this client
      const invoicesRef = collection(db, 'invoices');
      const invoicesQuery = query(
        invoicesRef,
        where('clientEmail', '==', currentUser.email)
        // orderBy('date', 'desc')
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      const invoicesData = [];
      invoicesSnapshot.forEach((doc) => {
        invoicesData.push({ id: doc.id, ...doc.data() });
      });

      // Sort by date in JavaScript (newest first)
      const sortedInvoices = invoicesData.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });

      setInvoices(sortedInvoices);

      // Use real completed invoices for payment history instead of mock data
      const completedInvoices = sortedInvoices.filter(inv => inv.status === 'completed');
      setPayments(completedInvoices);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'overdue':
        return '#dc3545';
      default:
        return '#6c757d';
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

  const handleMakePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
    // Reset form when opening modal
    setPaymentForm({
      paymentMethod: 'credit-card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setFormErrors({});
    setIsProcessing(false);
  };

  const validateForm = () => {
    const errors = {};
    
    // Card number validation (basic 16-digit format)
    if (!paymentForm.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(paymentForm.cardNumber.trim())) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    // Expiry date validation (MM/YY format)
    if (!paymentForm.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate.trim())) {
      errors.expiryDate = 'Please enter expiry date in MM/YY format';
    } else {
      const [month, year] = paymentForm.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiryDate = 'Card has expired';
      }
    }
    
    // CVV validation (3-4 digits)
    if (!paymentForm.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentForm.cvv.trim())) {
      errors.cvv = 'Please enter a valid 3 or 4 digit CVV';
    }
    
    // Cardholder name validation
    if (!paymentForm.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    } else if (paymentForm.cardholderName.trim().length < 2) {
      errors.cardholderName = 'Please enter a valid name';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    // This would integrate with a payment processor like Stripe
    console.log('Processing payment:', paymentForm);
    
    // Mock payment processing
    setTimeout(async () => {
      try {
        // Mark invoice as completed in Firestore
        const invoiceRef = doc(db, 'invoices', selectedInvoice.id);
        await updateDoc(invoiceRef, { 
          status: 'completed',
          paidAt: new Date(),
          paymentMethod: paymentForm.paymentMethod === 'credit-card' ? 'Credit Card' : 
                        paymentForm.paymentMethod === 'debit-card' ? 'Debit Card' : 'Bank Transfer'
        });
        
        alert('Payment processed successfully!');
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        setIsProcessing(false);
        
        // Refresh data to show updated status
        await fetchData();
      } catch (err) {
        console.error('Error updating invoice status:', err);
        alert('Error processing payment. Please try again.');
        setIsProcessing(false);
      }
    }, 2000);
  };

  // Use real completed invoices for payment history
  const outstandingInvoices = invoices.filter(inv => inv.status !== 'completed');
  const completedInvoices = invoices.filter(inv => inv.status === 'completed');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  if (loading) {
    return (
      <div className="client-payments">
        <div className="loading">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="client-payments">
      <header className="client-header">
        <div className="client-header-content">
          <h1>{t('Payments')}</h1>
          <div className="header-actions">
            <ThemeSwitcher />
            <Link to="/client/dashboard" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              {t('Back to Dashboard')}
            </Link>
          </div>
        </div>
      </header>

      <div className="client-container">
        <nav className="client-nav">
          <Link to="/client/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>
            {t('Dashboard')}
          </Link>
          <Link to="/client/invoices" className="nav-item">
            <i className="fas fa-file-invoice"></i>
            {t('My Invoices')}
          </Link>
          <Link to="/client/payments" className="nav-item active">
            <i className="fas fa-credit-card"></i>
            {t('Payments')}
          </Link>
          <Link to="/client/profile" className="nav-item">
            <i className="fas fa-user"></i>
            {t('Profile')}
          </Link>
        </nav>

        <main className="client-main">
          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="summary-card">
              <h3>{t('Outstanding Balance')}</h3>
              <p className="summary-amount outstanding">{formatCurrency(totalOutstanding)}</p>
              <span className="summary-label">{outstandingInvoices.length} {t('invoices pending')}</span>
            </div>
            <div className="summary-card">
              <h3>{t('Total Paid')}</h3>
              <p className="summary-amount paid">{formatCurrency(payments.reduce((sum, p) => sum + (p.total || 0), 0))}</p>
              <span className="summary-label">{payments.length} {t('payments made')}</span>
            </div>
            <div className="summary-card">
              <h3>{t('Last Payment')}</h3>
              <p className="summary-amount">
                {payments.length > 0 ? formatCurrency(payments[0].total || 0) : '$0.00'}
              </p>
              <span className="summary-label">
                {payments.length > 0 ? formatDate(payments[0].paidAt || payments[0].date) : t('No payments yet')}
              </span>
            </div>
          </div>

          {/* Outstanding Invoices */}
          <div className="outstanding-invoices">
            <div className="section-header">
              <h2>{t('Outstanding Invoices')}</h2>
              <p>{t('Make payments on your pending invoices')}</p>
            </div>

            {outstandingInvoices.length === 0 ? (
              <div className="no-outstanding">
                <i className="fas fa-check-circle"></i>
                <h3>{t('All caught up!')}</h3>
                <p>{t('You have no outstanding invoices.')}</p>
              </div>
            ) : (
              <div className="invoice-grid">
                {outstandingInvoices.map((invoice, index) => (
                  <div key={invoice.id} className="invoice-card">
                    <div className="invoice-header">
                      <h4>{t('Invoice')} INV-{invoice.id.slice(-8).toUpperCase()}</h4>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(invoice.status) }}
                      >
                        {t(invoice.status)}
                      </span>
                    </div>
                    <div className="invoice-details">
                      <p className="invoice-date">{t('Due')}: {formatDate(invoice.dueDate)}</p>
                      <p className="invoice-amount">{formatCurrency(invoice.total)}</p>
                    </div>
                    <button 
                      onClick={() => handleMakePayment(invoice)}
                      className="pay-btn"
                    >
                      <i className="fas fa-credit-card"></i>
                      {t('Pay Now')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="payment-history">
            <div className="section-header">
              <h2>{t('Payment History')}</h2>
              <p>{t('View your past payment transactions')}</p>
            </div>

            {completedInvoices.length === 0 ? (
              <div className="no-payments">
                <i className="fas fa-history"></i>
                <h3>{t('No payment history')}</h3>
                <p>{t('Your payment history will appear here.')}</p>
              </div>
            ) : (
              <div className="payments-table">
                <div className="table-header">
                  <div className="header-cell">{t('Payment Date')}</div>
                  <div className="header-cell">{t('Invoice #')}</div>
                  <div className="header-cell">{t('Client')}</div>
                  <div className="header-cell">{t('Total Amount')}</div>
                  <div className="header-cell">{t('Payment Method')}</div>
                  <div className="header-cell">{t('Status')}</div>
                </div>
                <div className="table-body">
                  {completedInvoices.sort((a, b) => {
                    const dateA = a.paidAt?.toDate ? a.paidAt.toDate() : (a.date?.toDate ? a.date.toDate() : new Date(a.date));
                    const dateB = b.paidAt?.toDate ? b.paidAt.toDate() : (b.date?.toDate ? b.date.toDate() : new Date(b.date));
                    return dateB - dateA;
                  }).map((inv, index) => (
                    <div key={inv.id} className="table-row">
                      <div className="table-cell" data-label={t('Payment Date')}>{formatDate(inv.paidAt || inv.date)}</div>
                      <div className="table-cell" data-label={t('Invoice #')}>INV-{inv.id.slice(-8).toUpperCase()}</div>
                      <div className="table-cell" data-label={t('Client')}>
                        <strong>{inv.clientName}</strong>
                      </div>
                      <div className="table-cell amount" data-label={t('Total Amount')}>
                        <strong>{formatCurrency(inv.total)}</strong>
                      </div>
                      <div className="table-cell" data-label={t('Payment Method')}>{inv.paymentMethod || t('Credit Card')}</div>
                      <div className="table-cell" data-label={t('Status')}>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(inv.status) }}>{t(inv.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>{t('Make Payment')}</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="invoice-summary">
                <h4>{t('Invoice')} INV-{selectedInvoice.id.slice(-8).toUpperCase()}</h4>
                <p className="amount">{formatCurrency(selectedInvoice.total)}</p>
                <p className="due-date">{t('Due')}: {formatDate(selectedInvoice.dueDate)}</p>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label>{t('Payment Method')}</label>
                  <select 
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  >
                    <option value="credit-card">{t('Credit Card')}</option>
                    <option value="debit-card">{t('Debit Card')}</option>
                    <option value="bank-transfer">{t('Bank Transfer')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('Card Number')}</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456" 
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                    className={formErrors.cardNumber ? 'error' : ''}
                  />
                  {formErrors.cardNumber && <span className="error-message">{formErrors.cardNumber}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Expiry Date')}</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      className={formErrors.expiryDate ? 'error' : ''}
                    />
                    {formErrors.expiryDate && <span className="error-message">{formErrors.expiryDate}</span>}
                  </div>
                  <div className="form-group">
                    <label>{t('CVV')}</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className={formErrors.cvv ? 'error' : ''}
                    />
                    {formErrors.cvv && <span className="error-message">{formErrors.cvv}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('Cardholder Name')}</label>
                  <input 
                    type="text" 
                    placeholder={t('Enter cardholder name')}
                    value={paymentForm.cardholderName}
                    onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                    className={formErrors.cardholderName ? 'error' : ''}
                  />
                  {formErrors.cardholderName && <span className="error-message">{formErrors.cardholderName}</span>}
                </div>

                <button 
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="process-payment-btn"
                >
                  {isProcessing ? t('Processing...') : t('Process Payment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPayments; 