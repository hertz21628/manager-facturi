import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const getMonthYear = date => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function safeFormatDate(date) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleDateString();
}

const Reports = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const invQ = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
      const clQ = query(collection(db, 'clients'));
      const [invSnap, clSnap] = await Promise.all([
        getDocs(invQ),
        getDocs(clQ)
      ]);
      const invoicesData = invSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      }));
      const clientsData = clSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invoicesData);
      setClients(clientsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Date filtering
  const filteredInvoices = invoices.filter(inv => {
    if (!dateRange.from && !dateRange.to) return true;
    const created = inv.createdAt;
    if (dateRange.from && created < new Date(dateRange.from)) return false;
    if (dateRange.to && created > new Date(dateRange.to + 'T23:59:59')) return false;
    return true;
  });

  // Financial Overview
  const totalRevenue = filteredInvoices.filter(i => i.status === 'Paid' || (i.total && i.paid)).reduce((sum, i) => sum + (i.total || 0), 0);
  const outstanding = filteredInvoices.filter(i => i.status !== 'Paid' && (!i.paid || i.paid < i.total)).reduce((sum, i) => sum + (i.total - (i.paid || 0)), 0);
  const totalInvoices = filteredInvoices.length;
  const totalTax = filteredInvoices.reduce((sum, i) => sum + (i.totalTax || 0), 0);

  // Invoices by Status
  const statusCounts = { Paid: 0, Unpaid: 0, Overdue: 0 };
  filteredInvoices.forEach(inv => {
    if (inv.status === 'Paid' || (inv.paid && inv.paid >= inv.total)) statusCounts.Paid++;
    else if (inv.dueDate && inv.dueDate < new Date() && (!inv.paid || inv.paid < inv.total)) statusCounts.Overdue++;
    else statusCounts.Unpaid++;
  });

  // Invoices Over Time
  const invoicesByMonth = {};
  filteredInvoices.forEach(inv => {
    const key = getMonthYear(inv.createdAt);
    invoicesByMonth[key] = (invoicesByMonth[key] || 0) + 1;
  });
  const months = Object.keys(invoicesByMonth).sort();
  const invoicesPerMonth = months.map(m => invoicesByMonth[m]);

  // Top Clients
  const clientTotals = {};
  filteredInvoices.forEach(inv => {
    const client = inv.clientId || inv.client || 'Unknown';
    clientTotals[client] = (clientTotals[client] || 0) + (inv.total || 0);
  });
  const topClients = Object.entries(clientTotals)
    .map(([client, total]) => ({ client, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Outstanding by Client
  const outstandingByClient = {};
  filteredInvoices.forEach(inv => {
    const client = inv.clientId || inv.client || 'Unknown';
    if (inv.status !== 'Paid' && (!inv.paid || inv.paid < inv.total)) {
      outstandingByClient[client] = (outstandingByClient[client] || 0) + (inv.total - (inv.paid || 0));
    }
  });

  // Export as CSV
  const exportCSV = () => {
    const rows = [
      ['Invoice #', 'Client', 'Amount', 'Status', 'Created', 'Due Date'],
      ...filteredInvoices.map(inv => [
        'INV-' + inv.id.slice(-8).toUpperCase(),
        inv.clientId || inv.client || 'Unknown',
        inv.total || 0,
        inv.status || (inv.paid && inv.paid >= inv.total ? 'Paid' : (inv.dueDate && inv.dueDate < new Date() ? 'Overdue' : 'Unpaid')),
        safeFormatDate(inv.createdAt),
        safeFormatDate(inv.dueDate)
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices_report.csv';
    a.click();
    URL.revokeObjectURL(url);
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
          <Link to="/reports" className="nav-link active">{t('Reports')}</Link>
          <Link to="/settings" className="nav-link">{t('Settings')}</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">{t('Logout')}</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>{t('Reports')}</h1>
          <p>{t('Business insights, analytics, and financial summaries.')}</p>
        </header>
        <div style={{ marginBottom: 30, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>{t('From:')}</label>
            <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #ddd', marginRight: 16 }} />
            <label style={{ fontWeight: 600, marginRight: 8 }}>{t('To:')}</label>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} style={{ padding: 8, borderRadius: 5, border: '1px solid #ddd', marginRight: 16 }} />
            <button onClick={exportCSV} style={{ padding: '8px 18px', background: '#6a11cb', color: 'white', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2575fc'} onMouseOut={e => e.currentTarget.style.background = '#6a11cb'}>{t('Export CSV')}</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginBottom: 30 }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 220, flex: 1 }}>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 6 }}>{t('Total Revenue')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#6a11cb' }}>{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 220, flex: 1 }}>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 6 }}>{t('Outstanding')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4757' }}>{outstanding.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 220, flex: 1 }}>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 6 }}>{t('Total Invoices')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{totalInvoices}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 220, flex: 1 }}>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 6 }}>{t('Total Tax Collected')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2575fc' }}>{totalTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginBottom: 30 }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, flex: 2, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>{t('Invoices by Status')}</div>
            <Pie
              data={{
                labels: [t('Paid'), t('Unpaid'), t('Overdue')],
                datasets: [{
                  data: [statusCounts.Paid, statusCounts.Unpaid, statusCounts.Overdue],
                  backgroundColor: ['#28a745', '#ffc107', '#ff4757'],
                }]
              }}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, flex: 3, minWidth: 400 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>{t('Invoices Over Time')}</div>
            <Bar
              data={{
                labels: months,
                datasets: [{
                  label: t('Invoices'),
                  data: invoicesPerMonth,
                  backgroundColor: '#6a11cb',
                }]
              }}
              options={{ plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: t('Month') } }, y: { title: { display: true, text: t('Count') }, beginAtZero: true } } }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginBottom: 30 }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, flex: 2, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>{t('Top Clients')}</div>
            <Bar
              data={{
                labels: topClients.map(c => c.client),
                datasets: [{
                  label: t('Total Invoiced'),
                  data: topClients.map(c => c.total),
                  backgroundColor: '#2575fc',
                }]
              }}
              options={{ plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: t('Client') } }, y: { title: { display: true, text: t('Amount') }, beginAtZero: true } } }}
            />
          </div>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, flex: 2, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>{t('Outstanding by Client')}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: 10, textAlign: 'left', fontWeight: 600, color: '#333' }}>{t('Client')}</th>
                  <th style={{ padding: 10, textAlign: 'left', fontWeight: 600, color: '#333' }}>{t('Outstanding')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(outstandingByClient).length === 0 ? (
                  <tr><td colSpan={2} style={{ textAlign: 'center', padding: 20 }}>{t('No outstanding invoices.')}</td></tr>
                ) : (
                  Object.entries(outstandingByClient).map(([client, amt]) => (
                    <tr key={client} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: 10 }}>{client}</td>
                      <td style={{ padding: 10, color: '#ff4757', fontWeight: 600 }}>{amt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports; 