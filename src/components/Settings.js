import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Dashboard.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ro', label: 'Romanian' },
  { code: 'de', label: 'German' },
];
const THEMES = [
  { code: 'light', label: 'Light' },
  { code: 'dark', label: 'Dark' },
  { code: 'system', label: 'System Default' },
];

const Settings = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    localStorage.setItem('language', language);
    // Here you would also update i18n or your translation system
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
          <Link to="/settings" className="nav-link active">Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>Settings</h1>
          <p>Customize your preferences for language and theme.</p>
        </header>
        <div className="feature-card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ marginBottom: 30 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 30 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Theme</label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
            >
              {THEMES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ color: '#888', fontSize: 14 }}>
            <p><strong>Language:</strong> Changes the language of the interface (where translations are available).</p>
            <p><strong>Theme:</strong> Switch between light, dark, or system default appearance.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 