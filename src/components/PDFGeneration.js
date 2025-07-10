import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

const PDFGeneration = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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
    doc.setFontSize(18);
    doc.text('Invoice', 14, 18);
    doc.setFontSize(12);
    doc.text(`Invoice #: INV-${invoice.id.slice(-8).toUpperCase()}`, 14, 28);
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, 14, 36);
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 14, 44);
    doc.text(`Payment Terms: ${invoice.paymentTerms || 'N/A'}`, 14, 52);
    doc.text(`Discount: ${formatCurrency(invoice.discount || 0)}`, 14, 60);
    doc.text(`Total: ${formatCurrency(invoice.total || 0)}`, 14, 68);
    doc.text('Line Items:', 14, 78);

    const tableData = invoice.lineItems.map(item => [
      item.description,
      item.quantity,
      formatCurrency(item.price),
      `${item.tax}%`,
      formatCurrency(item.quantity * item.price * (item.tax/100)),
      formatCurrency(item.quantity * item.price + item.quantity * item.price * (item.tax/100))
    ]);

    autoTable(doc, {
      head: [['Description', 'Qty', 'Price', 'Tax', 'Tax Amt', 'Line Total']],
      body: tableData,
      startY: 84,
      theme: 'grid',
      headStyles: { fillColor: [106, 17, 203] },
      styles: { fontSize: 10 },
    });

    doc.save(`invoice_${invoice.id.slice(-8)}.pdf`);
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
          <Link to="/invoices/pdf" className="nav-link active">PDF Generation</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>PDF Generation</h1>
          <p>Generate and download PDF versions of your invoices.</p>
        </header>
        <div className="feature-card" style={{ maxWidth: 'none' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>No invoices found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333' }}>Invoice #</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333' }}>Description</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333' }}>Amount</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333' }}>Created</th>
                    <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333' }}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #e9ecef', background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: 15, fontWeight: 600, color: '#6a11cb' }}>INV-{invoice.id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: 15 }}>{invoice.lineItems?.[0]?.description || 'No description'}{invoice.lineItems?.length > 1 && ` +${invoice.lineItems.length - 1} more items`}</td>
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