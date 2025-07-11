import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import './Dashboard.css';

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line
  }, []);

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
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
      setInvoices(invoices => invoices.filter(inv => inv.id !== invoiceId));
    } catch (error) {
      alert('Failed to delete invoice.');
    }
    setDeleting(false);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL invoices? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const q = query(collection(db, 'invoices'));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach(docSnap => {
        batch.delete(doc(db, 'invoices', docSnap.id));
      });
      await batch.commit();
      setInvoices([]);
    } catch (error) {
      alert('Failed to delete all invoices.');
    }
    setDeleting(false);
  };

  const getStatusColor = (invoice) => {
    if (!invoice.dueDate) return '#6c757d';
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return '#dc3545'; // Overdue
    if (daysUntilDue <= 7) return '#ffc107'; // Due soon
    return '#28a745'; // On track
  };

  const getStatusText = (invoice) => {
    if (!invoice.dueDate) return 'No due date';
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'Overdue';
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue <= 7) return `Due in ${daysUntilDue} days`;
    return 'On track';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesFilter = filter === 'all' || 
      (filter === 'overdue' && getStatusText(invoice) === 'Overdue') ||
      (filter === 'due-soon' && getStatusText(invoice).includes('Due in')) ||
      (filter === 'on-track' && getStatusText(invoice) === 'On track');
    
    const matchesSearch = invoice.lineItems?.some(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || invoice.paymentTerms?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && (searchTerm === '' || matchesSearch);
  });

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

  if (loading) {
    return (
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>InvoiceApp</h2>
          </div>
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/clients" className="nav-link">Clients</Link>
            <Link to="/invoices" className="nav-link active">Invoices</Link>
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
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading invoices...</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>InvoiceApp</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/clients" className="nav-link">Clients</Link>
          <Link to="/invoices" className="nav-link active">Invoices</Link>
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
          <h1>Invoice List & Status</h1>
          <p>Track the status of all your invoices, from sent to paid.</p>
        </header>

        <div className="feature-card" style={{ maxWidth: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Invoices</option>
                <option value="overdue">Overdue</option>
                <option value="due-soon">Due Soon</option>
                <option value="on-track">On Track</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link 
                to="/invoices/new"
                style={{
                  padding: '10px 20px',
                  background: '#6a11cb',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                + Create New Invoice
              </Link>
              <button
                onClick={handleDeleteAll}
                disabled={deleting || invoices.length === 0}
                style={{
                  padding: '10px 20px',
                  background: '#ff4757',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: deleting || invoices.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Delete All
              </button>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h3>No invoices found</h3>
              <p>Create your first invoice to get started.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                    <th className="invoice-th">Invoice #</th>
                    <th className="invoice-th">Description</th>
                    <th className="invoice-th">Amount</th>
                    <th className="invoice-th">Status</th>
                    <th className="invoice-th">Due Date</th>
                    <th className="invoice-th">Payment Terms</th>
                    <th className="invoice-th">Created</th>
                    <th className="invoice-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr 
                      key={invoice.id} 
                      style={{ 
                        borderBottom: '1px solid #e9ecef',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}
                    >
                      <td style={{ padding: '15px', fontWeight: '600', color: '#6a11cb' }}>
                        INV-{invoice.id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {invoice.lineItems?.[0]?.description || 'No description'}
                        {invoice.lineItems?.length > 1 && ` +${invoice.lineItems.length - 1} more items`}
                      </td>
                      <td style={{ padding: '15px', fontWeight: '600' }}>
                        {formatCurrency(invoice.total || 0)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'white',
                          backgroundColor: getStatusColor(invoice)
                        }}>
                          {getStatusText(invoice)}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {invoice.paymentTerms || 'N/A'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          disabled={deleting}
                          style={{
                            padding: '8px 14px',
                            background: '#ff4757',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: deleting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong>Total Invoices:</strong> {filteredInvoices.length}
              </div>
              <div>
                <strong>Total Amount:</strong> {formatCurrency(filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0))}
              </div>
              <div>
                <strong>Overdue:</strong> {filteredInvoices.filter(invoice => getStatusText(invoice) === 'Overdue').length}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceList; 