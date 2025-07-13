import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import './Dashboard.css';
import './ClientManagement.css';
import { useTranslation } from 'react-i18next';

const initialForm = { name: '', email: '', company: '', phone: '' };

const ClientManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
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
    fetchClients();
    // eslint-disable-next-line
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'clients'), orderBy(sortBy, sortDir));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(data);
    } catch (error) {
      alert('Failed to fetch clients.');
    }
    setLoading(false);
  };

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email) return alert('Name and Email are required');
    try {
      if (editingId) {
        await updateDoc(doc(db, 'clients', editingId), form);
        setClients(clients => clients.map(c => c.id === editingId ? { ...c, ...form } : c));
        setEditingId(null);
      } else {
        const docRef = await addDoc(collection(db, 'clients'), form);
        setClients([{ id: docRef.id, ...form }, ...clients]);
      }
      setForm(initialForm);
    } catch (error) {
      alert('Failed to save client.');
    }
  };

  const handleEdit = client => {
    setForm({ name: client.name, email: client.email, company: client.company, phone: client.phone });
    setEditingId(client.id);
  };

  const handleDelete = async id => {
    if (!window.confirm(t('Delete this client?'))) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(clients => clients.filter(c => c.id !== id));
    } catch (error) {
      alert(t('Failed to delete client.'));
    }
    setDeleting(false);
  };

  const handleSort = field => {
    if (sortBy === field) setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');
    else setSortBy(field);
    setTimeout(fetchClients, 0);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>InvoiceApp</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">{t('Dashboard')}</Link>
          <Link to="/clients" className="nav-link active">{t('Clients')}</Link>
          <Link to="/invoices" className="nav-link">{t('Invoices')}</Link>
          <Link to="/reports" className="nav-link">{t('Reports')}</Link>
          <Link to="/settings" className="nav-link">{t('Settings')}</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">{t('Logout')}</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>{t('Client Management')}</h1>
          <p>{t('Add, view, and organize your client information.')}</p>
        </header>
        <div className="feature-card" style={{ maxWidth: 'none' }}>
          <form onSubmit={handleSubmit} className="client-form">
            <input name="name" value={form.name} onChange={handleInput} placeholder={t('Full Name')} required className="client-input" />
            <input name="email" value={form.email} onChange={handleInput} placeholder={t('Email')} required className="client-input" />
            <input name="company" value={form.company} onChange={handleInput} placeholder={t('Company')} className="client-input" />
            <input name="phone" value={form.phone} onChange={handleInput} placeholder={t('Phone')} className="client-input" />
            <button
              type="submit"
              className="client-button"
            >
              {editingId ? t('Update Client') : t('Add Client')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setForm(initialForm); setEditingId(null); }}
                className="client-button cancel"
              >
                {t('Cancel')}
              </button>
            )}
          </form>
          <div className="client-search-container">
            <input
              type="text"
              placeholder={t('Search clients...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="client-search"
            />
            <div className="client-total">{t('Total')}: {filteredClients.length}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="client-table">
              <thead>
                <tr>
                  <th className="invoice-th">{t('Name')} {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="invoice-th">{t('Email')} {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="invoice-th">{t('Company')} {sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="invoice-th" onClick={() => handleSort('phone')}>{t('Phone')} {sortBy === 'phone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="invoice-th">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="client-loading">{t('Loading...')}</td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan={5} className="client-empty">{t('No clients found.')}</td></tr>
                ) : filteredClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.company}</td>
                    <td>{client.phone}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(client)}
                        className="client-edit-button"
                      >
                        {t('Edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        disabled={deleting}
                        className="client-delete-button"
                      >
                        {t('Delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientManagement; 