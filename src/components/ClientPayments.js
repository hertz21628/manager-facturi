import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientPayments.css';

const ClientPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { currentUser } = useAuth();

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
        where('clientEmail', '==', currentUser.email),
        orderBy('date', 'desc')
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      const invoicesData = [];
      invoicesSnapshot.forEach((doc) => {
        invoicesData.push({ id: doc.id, ...doc.data() });
      });

      setInvoices(invoicesData);

      // Fetch payment history (mock data for now)
      const mockPayments = [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          amount: 1500.00,
          date: new Date('2024-01-15'),
          method: 'Credit Card',
          status: 'completed',
          reference: 'TXN-123456'
        },
        {
          id: '2',
          invoiceNumber: 'INV-002',
          amount: 750.00,
          date: new Date('2024-01-10'),
          method: 'Bank Transfer',
          status: 'completed',
          reference: 'TXN-123457'
        }
      ];

      setPayments(mockPayments);
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
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date.toDate()).toLocaleDateString();
  };

  const handleMakePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    // This would integrate with a payment processor like Stripe
    console.log('Processing payment:', paymentData);
    
    // Mock payment processing
    setTimeout(() => {
      alert('Payment processed successfully!');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      // Refresh data
      fetchData();
    }, 2000);
  };

  const outstandingInvoices = invoices.filter(inv => inv.status !== 'paid');
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
          <h1>Payments</h1>
          <div className="header-actions">
            <ThemeSwitcher />
            <Link to="/client/dashboard" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="client-container">
        <nav className="client-nav">
          <Link to="/client/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </Link>
          <Link to="/client/invoices" className="nav-item">
            <i className="fas fa-file-invoice"></i>
            My Invoices
          </Link>
          <Link to="/client/payments" className="nav-item active">
            <i className="fas fa-credit-card"></i>
            Payments
          </Link>
          <Link to="/client/profile" className="nav-item">
            <i className="fas fa-user"></i>
            Profile
          </Link>
        </nav>

        <main className="client-main">
          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="summary-card">
              <h3>Outstanding Balance</h3>
              <p className="summary-amount outstanding">{formatCurrency(totalOutstanding)}</p>
              <span className="summary-label">{outstandingInvoices.length} invoices pending</span>
            </div>
            <div className="summary-card">
              <h3>Total Paid</h3>
              <p className="summary-amount paid">{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</p>
              <span className="summary-label">{payments.length} payments made</span>
            </div>
            <div className="summary-card">
              <h3>Last Payment</h3>
              <p className="summary-amount">
                {payments.length > 0 ? formatCurrency(payments[0].amount) : '$0.00'}
              </p>
              <span className="summary-label">
                {payments.length > 0 ? formatDate(payments[0].date) : 'No payments yet'}
              </span>
            </div>
          </div>

          {/* Outstanding Invoices */}
          <div className="outstanding-invoices">
            <div className="section-header">
              <h2>Outstanding Invoices</h2>
              <p>Make payments on your pending invoices</p>
            </div>

            {outstandingInvoices.length === 0 ? (
              <div className="no-outstanding">
                <i className="fas fa-check-circle"></i>
                <h3>All caught up!</h3>
                <p>You have no outstanding invoices.</p>
              </div>
            ) : (
              <div className="invoice-grid">
                {outstandingInvoices.map((invoice) => (
                  <div key={invoice.id} className="invoice-card">
                    <div className="invoice-header">
                      <h4>Invoice #{invoice.invoiceNumber}</h4>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(invoice.status) }}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="invoice-details">
                      <p className="invoice-date">Due: {formatDate(invoice.dueDate)}</p>
                      <p className="invoice-amount">{formatCurrency(invoice.total)}</p>
                    </div>
                    <button 
                      onClick={() => handleMakePayment(invoice)}
                      className="pay-btn"
                    >
                      <i className="fas fa-credit-card"></i>
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="payment-history">
            <div className="section-header">
              <h2>Payment History</h2>
              <p>View your past payment transactions</p>
            </div>

            {payments.length === 0 ? (
              <div className="no-payments">
                <i className="fas fa-history"></i>
                <h3>No payment history</h3>
                <p>Your payment history will appear here.</p>
              </div>
            ) : (
              <div className="payments-table">
                <div className="table-header">
                  <div className="header-cell">Date</div>
                  <div className="header-cell">Invoice #</div>
                  <div className="header-cell">Amount</div>
                  <div className="header-cell">Method</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Reference</div>
                </div>
                
                <div className="table-body">
                  {payments.map((payment) => (
                    <div key={payment.id} className="table-row">
                      <div className="table-cell">
                        {formatDate(payment.date)}
                      </div>
                      <div className="table-cell">
                        <strong>{payment.invoiceNumber}</strong>
                      </div>
                      <div className="table-cell amount">
                        <strong>{formatCurrency(payment.amount)}</strong>
                      </div>
                      <div className="table-cell">
                        {payment.method}
                      </div>
                      <div className="table-cell">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(payment.status) }}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div className="table-cell">
                        <small>{payment.reference}</small>
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
              <h3>Make Payment</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="invoice-summary">
                <h4>Invoice #{selectedInvoice.invoiceNumber}</h4>
                <p className="amount">{formatCurrency(selectedInvoice.total)}</p>
                <p className="due-date">Due: {formatDate(selectedInvoice.dueDate)}</p>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select defaultValue="credit-card">
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="bank-transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Name on Card</label>
                  <input type="text" placeholder="John Doe" />
                </div>

                <button 
                  onClick={() => handlePaymentSubmit(selectedInvoice)}
                  className="process-payment-btn"
                >
                  <i className="fas fa-lock"></i>
                  Process Payment
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