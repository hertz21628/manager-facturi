import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getCurrencyOptions, getCurrencyName } from '../utils/currency';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    defaultCurrency: 'USD',
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    taxRate: 0,
    invoicePrefix: 'INV',
    autoNumbering: true,
    emailNotifications: true,
    paymentReminders: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      loadSettings();
    }
  }, [currentUser]);

  const loadSettings = async () => {
    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.settings) {
          setSettings(prev => ({ ...prev, ...userData.settings }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      await setDoc(userDoc, { 
        settings: settings 
      }, { merge: true });
      
      setMessage({ type: 'success', text: t('Settings saved successfully!') });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: t('Failed to save settings.') });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
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
            <Link to="/settings" className="nav-link active">{t('Settings')}</Link>
          </nav>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">{t('Logout')}</button>
          </div>
        </aside>
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>{t('Loading settings...')}</h2>
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
          <Link to="/dashboard" className="nav-link">{t('Dashboard')}</Link>
          <Link to="/clients" className="nav-link">{t('Clients')}</Link>
          <Link to="/invoices" className="nav-link">{t('Invoices')}</Link>
          <Link to="/reports" className="nav-link">{t('Reports')}</Link>
          <Link to="/settings" className="nav-link active">{t('Settings')}</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">{t('Logout')}</button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="main-header">
          <h1>{t('Settings')}</h1>
          <p>{t('Configure your application preferences and company information.')}</p>
        </header>

        <div className="feature-card" style={{ maxWidth: 'none' }}>
          {message.text && (
            <div style={{ 
              padding: '10px', 
              background: message.type === 'success' ? '#d4edda' : '#f8d7da', 
              color: message.type === 'success' ? '#155724' : '#721c24', 
              borderRadius: '5px', 
              marginBottom: '20px',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Currency Settings */}
            <div>
              <h3 style={{ marginBottom: '20px', color: '#6a11cb' }}>{t('Currency Settings')}</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Default Currency')}:
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  {getCurrencyOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {t('This will be the default currency for new invoices.')}
                </small>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Default Tax Rate')} (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {t('Default tax rate applied to new line items.')}
                </small>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 style={{ marginBottom: '20px', color: '#6a11cb' }}>{t('Company Information')}</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Company Name')}:
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Company Email')}:
                </label>
                <input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Company Phone')}:
                </label>
                <input
                  type="text"
                  value={settings.companyPhone}
                  onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Company Address')}:
                </label>
                <textarea
                  value={settings.companyAddress}
                  onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#6a11cb' }}>{t('Invoice Settings')}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t('Invoice Number Prefix')}:
                </label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleSettingChange('invoicePrefix', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {t('Prefix for invoice numbers (e.g., INV, BILL, etc.)')}
                </small>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={settings.autoNumbering}
                    onChange={(e) => handleSettingChange('autoNumbering', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  {t('Auto-numbering for invoices')}
                </label>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {t('Automatically generate sequential invoice numbers')}
                </small>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#6a11cb' }}>{t('Notification Settings')}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  {t('Email notifications')}
                </label>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {t('Receive email notifications for important events')}
                </small>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={settings.paymentReminders}
                    onChange={(e) => handleSettingChange('paymentReminders', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  {t('Payment reminders')}
                </label>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  {t('Send automatic payment reminders for overdue invoices')}
                </small>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#6a11cb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? t('Saving...') : t('Save Settings')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 