import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import './Dashboard.css';

const initialForm = { name: '', email: '', company: '', phone: '' };

const buttonStyle = {
  padding: '10px 24px',
  background: '#6a11cb',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const buttonHoverStyle = {
  background: '#2575fc',
};
const cancelButtonStyle = {
  ...buttonStyle,
  background: '#aaa',
};
const editButtonStyle = {
  padding: '7px 14px',
  background: '#6a11cb',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  fontWeight: 600,
  fontSize: 13,
  marginRight: 8,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const editButtonHoverStyle = {
  background: '#2575fc',
};
const deleteButtonStyle = {
  padding: '7px 14px',
  background: '#ff4757',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const deleteButtonHoverStyle = {
  background: '#d90429',
};

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deleting, setDeleting] = useState(false);
  const [addHover, setAddHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const [editHoverId, setEditHoverId] = useState(null);
  const [deleteHoverId, setDeleteHoverId] = useState(null);

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
    if (!window.confirm('Delete this client?')) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(clients => clients.filter(c => c.id !== id));
    } catch (error) {
      alert('Failed to delete client.');
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
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/clients" className="nav-link active">Clients</Link>
          <Link to="/invoices" className="nav-link">Invoices</Link>
          <Link to="/reports" className="nav-link">Reports</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>Client Management</h1>
          <p>Add, view, and organize your client information.</p>
        </header>
        <div className="feature-card" style={{ maxWidth: 'none' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: 30 }}>
            <input name="name" value={form.name} onChange={handleInput} placeholder="Full Name" required style={{ flex: 2, minWidth: 120, padding: 10, border: '1px solid #ddd', borderRadius: 5 }} />
            <input name="email" value={form.email} onChange={handleInput} placeholder="Email" required style={{ flex: 2, minWidth: 120, padding: 10, border: '1px solid #ddd', borderRadius: 5 }} />
            <input name="company" value={form.company} onChange={handleInput} placeholder="Company" style={{ flex: 2, minWidth: 120, padding: 10, border: '1px solid #ddd', borderRadius: 5 }} />
            <input name="phone" value={form.phone} onChange={handleInput} placeholder="Phone" style={{ flex: 2, minWidth: 120, padding: 10, border: '1px solid #ddd', borderRadius: 5 }} />
            <button
              type="submit"
              style={editingId ? { ...buttonStyle, ...(addHover ? buttonHoverStyle : {}) } : { ...buttonStyle, ...(addHover ? buttonHoverStyle : {}) }}
              onMouseEnter={() => setAddHover(true)}
              onMouseLeave={() => setAddHover(false)}
            >
              {editingId ? 'Update' : 'Add'} Client
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setForm(initialForm); setEditingId(null); }}
                style={{ ...cancelButtonStyle, ...(cancelHover ? buttonHoverStyle : {}) }}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
              >
                Cancel
              </button>
            )}
          </form>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5, fontSize: 14, minWidth: 200 }}
            />
            <div style={{ fontWeight: 600, color: '#6a11cb' }}>Total: {filteredClients.length}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333', cursor: 'pointer' }} onClick={() => handleSort('name')}>Name {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333', cursor: 'pointer' }} onClick={() => handleSort('email')}>Email {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333', cursor: 'pointer' }} onClick={() => handleSort('company')}>Company {sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333', cursor: 'pointer' }} onClick={() => handleSort('phone')}>Phone {sortBy === 'phone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th style={{ padding: 15, textAlign: 'left', fontWeight: 600, color: '#333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>Loading...</td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>No clients found.</td></tr>
                ) : filteredClients.map(client => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #e9ecef', background: '#fff' }}>
                    <td style={{ padding: 15 }}>{client.name}</td>
                    <td style={{ padding: 15 }}>{client.email}</td>
                    <td style={{ padding: 15 }}>{client.company}</td>
                    <td style={{ padding: 15 }}>{client.phone}</td>
                    <td style={{ padding: 15 }}>
                      <button
                        onClick={() => handleEdit(client)}
                        style={{ ...editButtonStyle, ...(editHoverId === client.id ? editButtonHoverStyle : {}) }}
                        onMouseEnter={() => setEditHoverId(client.id)}
                        onMouseLeave={() => setEditHoverId(null)}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        disabled={deleting}
                        style={{ ...deleteButtonStyle, ...(deleteHoverId === client.id ? deleteButtonHoverStyle : {}), cursor: deleting ? 'not-allowed' : 'pointer' }}
                        onMouseEnter={() => setDeleteHoverId(client.id)}
                        onMouseLeave={() => setDeleteHoverId(null)}
                      >
                        Delete
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