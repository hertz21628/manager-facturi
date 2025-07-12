import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientInvoices.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencySymbols = { USD: '$', EUR: '€', RON: 'lei', GBP: '£' };

const ClientInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
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
        where('clientEmail', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      
      const invoicesData = [];
      querySnapshot.forEach((doc) => {
        invoicesData.push({ id: doc.id, ...doc.data() });
      });

      // Sort by date in JavaScript (newest first)
      const sortedInvoices = invoicesData.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });

      setInvoices(sortedInvoices);
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
    const doc = new jsPDF();
    const symbol = currencySymbols[invoice.currency || 'USD'] || '$';
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(106, 17, 203);
    doc.text('INVOICE', 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Invoice #: INV-${invoice.id.slice(-8).toUpperCase()}`, 14, 30);
    doc.text(`Date: ${formatDate(invoice.date)}`, 14, 38);
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 14, 46);
    doc.text(`Payment Terms: ${invoice.paymentTerms || 'N/A'}`, 14, 54);
    doc.text(`Currency: ${invoice.currency || 'USD'}`, 14, 62);
    
    // Company Info (placeholder)
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('Your Company Name', 150, 20);
    doc.text('Address Line 1', 150, 26);
    doc.text('Address Line 2', 150, 32);
    doc.text('Email: company@email.com', 150, 38);
    doc.text('Phone: +123456789', 150, 44);
    
    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Bill To:', 14, 74);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    let clientY = 80;
    if (invoice.clientName) {
      doc.text(invoice.clientName, 14, clientY); clientY += 6;
    }
    if (invoice.clientEmail) {
      doc.text(invoice.clientEmail, 14, clientY); clientY += 6;
    }
    if (invoice.clientCompany) {
      doc.text(invoice.clientCompany, 14, clientY); clientY += 6;
    }
    
    // Table
    const tableY = Math.max(clientY, 92);
    const tableData = invoice.lineItems?.map(item => [
      item.description,
      item.quantity,
      symbol + parseFloat(item.price).toFixed(2),
      `${item.tax}%`,
      symbol + (item.quantity * item.price * (item.tax/100)).toFixed(2),
      symbol + (item.quantity * item.price + item.quantity * item.price * (item.tax/100)).toFixed(2)
    ]) || [];
    
    autoTable(doc, {
      head: [['Description', 'Qty', 'Price', 'Tax', 'Tax Amt', 'Line Total']],
      body: tableData,
      startY: tableY,
      theme: 'striped',
      headStyles: { fillColor: [106, 17, 203], textColor: 255, fontSize: 11 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      styles: { cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
    
    // Summary
    let summaryY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary', 150, summaryY);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    summaryY += 6;
    doc.text(`Subtotal: ${symbol}${(invoice.subtotal || 0).toFixed(2)}`, 150, summaryY);
    summaryY += 6;
    doc.text(`Tax: ${symbol}${(invoice.totalTax || 0).toFixed(2)}`, 150, summaryY);
    summaryY += 6;
    doc.text(`Discount: ${symbol}${(invoice.discount || 0).toFixed(2)}`, 150, summaryY);
    summaryY += 6;
    doc.setFontSize(13);
    doc.setTextColor(106, 17, 203);
    doc.text(`Total: ${symbol}${(invoice.total || 0).toFixed(2)}`, 150, summaryY);
    
    // Footer/Notes
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for your business!', 14, 285);
    
    doc.save(`invoice_${invoice.id.slice(-8)}.pdf`);
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
                        <button 
                          className="action-btn view"
                          onClick={() => openModal(invoice)}
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
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

export default ClientInvoices; 