import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

const currencySymbols = { USD: '$', EUR: '€', RON: 'lei', GBP: '£' };

const PDFGeneration = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const invoicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          dueDate: doc.data().dueDate?.toDate()
        }));
        setInvoices(invoicesData);
      } catch (error) {
        alert('Failed to fetch invoices.');
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    const symbol = currencySymbols[invoice.currency || 'USD'] || '$';
    // Header
    doc.setFontSize(22);
    doc.setTextColor(106, 17, 203);
    doc.text('INVOICE', 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Invoice #: INV-${invoice.id.slice(-8).toUpperCase()}`, 14, 30);
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, 14, 38);
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
    // Client Info (if available)
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
    const tableData = invoice.lineItems.map(item => [
      item.description,
      item.quantity,
      symbol + parseFloat(item.price).toFixed(2),
      `${item.tax}%`,
      symbol + (item.quantity * item.price * (item.tax/100)).toFixed(2),
      symbol + (item.quantity * item.price + item.quantity * item.price * (item.tax/100)).toFixed(2)
    ]);
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

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>InvoiceApp</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">{t('Dashboard')}</Link>
          <Link to="/clients" className="nav-link">{t('Clients')}</Link>
          <Link to="/invoices" className="nav-link">{t('Invoices')}</Link>
          <Link to="/reports" className="nav-link">{t('Reports')}</Link>
          <Link to="/settings" className="nav-link">{t('Settings')}</Link>
          <Link to="/invoices/pdf" className="nav-link active">{t('PDF Generation')}</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">{t('Logout')}</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>{t('PDF Generation')}</h1>
          <p>{t('Generate and download PDF versions of your invoices.')}</p>
        </header>
        <div className="feature-card" style={{ maxWidth: 'none' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>{t('Loading...')}</div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>{t('No invoices found.')}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                    <th className="invoice-th">Invoice #</th>
                    <th className="invoice-th">{t('Description') || 'Description'}</th>
                    <th className="invoice-th">{t('Amount') || 'Amount'}</th>
                    <th className="invoice-th">{t('Created') || 'Created'}</th>
                    <th className="invoice-th">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #e9ecef', background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: 15, fontWeight: 600, color: '#6a11cb' }}>INV-{invoice.id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: 15 }}>{invoice.lineItems?.[0]?.description || t('No description')}{invoice.lineItems?.length > 1 && ` +${invoice.lineItems.length - 1} more items`}</td>
                      <td style={{ padding: 15, fontWeight: 600 }}>{formatCurrency(invoice.total || 0)}</td>
                      <td style={{ padding: 15 }}>{formatDate(invoice.createdAt)}</td>
                      <td style={{ padding: 15 }}>
                        <button
                          onClick={() => generatePDF(invoice)}
                          style={{
                            padding: '8px 18px',
                            background: '#6a11cb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 5,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#2575fc'}
                          onMouseOut={e => e.currentTarget.style.background = '#6a11cb'}
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PDFGeneration; 