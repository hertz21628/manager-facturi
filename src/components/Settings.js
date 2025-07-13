import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { getCurrencyOptions, getCurrencyName } from '../utils/currency';
import './Dashboard.css';
import './Settings.css';
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
            <div className={`settings-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="settings-container">
            {/* Currency Settings */}
            <div className="settings-section">
              <h3>{t('Currency Settings')}</h3>
              
              <div className="settings-field">
                <label>
                  {t('Default Currency')}:
                </label>
                <select
                  className="settings-select short"
                  value={settings.defaultCurrency}
                  onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                >
                  {getCurrencyOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small className="settings-help-text">
                  {t('This will be the default currency for new invoices.')}
                </small>
              </div>

              <div className="settings-field">
                <label>
                  {t('Default Tax Rate')} (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="settings-input short"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                />
                <small className="settings-help-text">
                  {t('Default tax rate applied to new line items.')}
                </small>
              </div>
            </div>

            {/* Company Information */}
            <div className="settings-section">
              <h3>{t('Company Information')}</h3>
              
              <div className="settings-field">
                <label>
                  {t('Company Name')}:
                </label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.companyName}
                  onChange={(e) => handleSettingChange('companyName', e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label>
                  {t('Company Email')}:
                </label>
                <input
                  type="email"
                  className="settings-input"
                  value={settings.companyEmail}
                  onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label>
                  {t('Company Phone')}:
                </label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.companyPhone}
                  onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                />
              </div>

              <div className="settings-field">
                <label>
                  {t('Company Address')}:
                </label>
                <textarea
                  className="settings-textarea"
                  value={settings.companyAddress}
                  onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div style={{ marginTop: '30px' }}>
            <h3>{t('Invoice Settings')}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="settings-field">
                <label>
                  {t('Invoice Number Prefix')}:
                </label>
                <input
                  type="text"
                  className="settings-input short"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleSettingChange('invoicePrefix', e.target.value)}
                />
                <small className="settings-help-text">
                  {t('Prefix for invoice numbers (e.g., INV, BILL, etc.)')}
                </small>
              </div>

              <div className="settings-field">
                <label className="settings-checkbox-container">
                  <input
                    type="checkbox"
                    className="settings-checkbox"
                    checked={settings.autoNumbering}
                    onChange={(e) => handleSettingChange('autoNumbering', e.target.checked)}
                  />
                  {t('Auto-numbering for invoices')}
                </label>
                <small className="settings-help-text">
                  {t('Automatically generate sequential invoice numbers')}
                </small>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div style={{ marginTop: '30px' }}>
            <h3>{t('Notification Settings')}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="settings-field">
                <label className="settings-checkbox-container">
                  <input
                    type="checkbox"
                    className="settings-checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                  {t('Email notifications')}
                </label>
                <small className="settings-help-text">
                  {t('Receive email notifications for important events')}
                </small>
              </div>

              <div className="settings-field">
                <label className="settings-checkbox-container">
                  <input
                    type="checkbox"
                    className="settings-checkbox"
                    checked={settings.paymentReminders}
                    onChange={(e) => handleSettingChange('paymentReminders', e.target.checked)}
                  />
                  {t('Payment reminders')}
                </label>
                <small className="settings-help-text">
                  {t('Send automatic payment reminders for overdue invoices')}
                </small>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              className="settings-save-button"
              onClick={handleSave}
              disabled={saving}
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