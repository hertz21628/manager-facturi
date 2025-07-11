import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientInvoices.css';

const ClientInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchInvoices();
    }
  }, [currentUser]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(
        invoicesRef,
        where('clientEmail', '==', currentUser.email),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const invoicesData = [];
      querySnapshot.forEach((doc) => {
        invoicesData.push({ id: doc.id, ...doc.data() });
      });

      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
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

  const downloadInvoice = (invoice) => {
    // This would integrate with your PDF generation service
    console.log('Downloading invoice:', invoice.id);
    // For now, just show an alert
    alert('PDF download functionality will be implemented here');
  };

  if (loading) {
    return (
      <div className="client-invoices">
        <div className="loading">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="client-invoices">
      <header className="client-header">
        <div className="client-header-content">
          <h1>My Invoices</h1>
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
          <Link to="/client/invoices" className="nav-item active">
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
          <div className="invoices-header">
            <div className="invoices-title">
              <h2>Invoice History</h2>
              <p>View and manage all your invoices</p>
            </div>
            
            <div className="invoices-filters">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="invoices-summary">
            <div className="summary-item">
              <span className="summary-label">Total Invoices:</span>
              <span className="summary-value">{invoices.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pending:</span>
              <span className="summary-value pending">
                {invoices.filter(inv => inv.status === 'pending').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Paid:</span>
              <span className="summary-value paid">
                {invoices.filter(inv => inv.status === 'paid').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Overdue:</span>
              <span className="summary-value overdue">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </span>
            </div>
          </div>

          <div className="invoices-content">
            {filteredInvoices.length === 0 ? (
              <div className="no-invoices">
                <i className="fas fa-file-invoice"></i>
                <h3>No invoices found</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'You don\'t have any invoices yet'
                  }
                </p>
              </div>
            ) : (
              <div className="invoices-table">
                <div className="table-header">
                  <div className="header-cell">Invoice #</div>
                  <div className="header-cell">Date</div>
                  <div className="header-cell">Amount</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Due Date</div>
                  <div className="header-cell">Actions</div>
                </div>
                
                <div className="table-body">
                  {filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="table-row">
                      <div className="table-cell invoice-number">
                        <strong>#{invoice.invoiceNumber}</strong>
                        <small>{invoice.clientName}</small>
                      </div>
                      <div className="table-cell">
                        {formatDate(invoice.date)}
                      </div>
                      <div className="table-cell amount">
                        <strong>{formatCurrency(invoice.total)}</strong>
                      </div>
                      <div className="table-cell">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(invoice.status) }}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <div className="table-cell">
                        {formatDate(invoice.dueDate)}
                      </div>
                      <div className="table-cell actions">
                        <Link 
                          to={`/client/invoices/${invoice.id}`}
                          className="action-btn view"
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </Link>
                        <button 
                          onClick={() => downloadInvoice(invoice)}
                          className="action-btn download"
                        >
                          <i className="fas fa-download"></i>
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientInvoices; 