import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import './ClientProfile.css';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ro', label: 'Romanian' },
  { code: 'de', label: 'German' },
];

const ClientProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const { t } = useTranslation();
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      notifications: {
        email: true,
        sms: false
      }
    }
  });

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language]);

  const loadProfile = async () => {
    try {
      // Load from Firestore
      const userDoc = await getDoc(doc(db, 'clients', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile(prev => ({
          ...prev,
          ...userData,
          email: currentUser.email || ''
        }));
      } else {
        // Set default values
        setProfile(prev => ({
          ...prev,
          email: currentUser.email || '',
          firstName: currentUser.displayName?.split(' ')[0] || '',
          lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (section, key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section],
          [key]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // Update Firebase Auth display name
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: `${profile.firstName} ${profile.lastName}`.trim()
        });
      }

      // Save to Firestore
      await setDoc(doc(db, 'clients', currentUser.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        company: profile.company,
        address: profile.address,
        preferences: profile.preferences,
        updatedAt: new Date()
      });

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="client-profile">
        <div className="loading">{t('Loading profile...')}</div>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <header className="client-header">
        <div className="client-header-content">
          <h1>{t('My Profile')}</h1>
          <div className="header-actions">
            <ThemeSwitcher />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-selector"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {t(l.label)}
                </option>
              ))}
            </select>
            <Link to="/client/dashboard" className="back-btn">
              <i className="fas fa-arrow-left"></i>
              {t('Back to Dashboard')}
            </Link>
          </div>
        </div>
      </header>

      <div className="client-container">
        <nav className="client-nav">
          <Link to="/client/dashboard" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>
            {t('Dashboard')}
          </Link>
          <Link to="/client/invoices" className="nav-item">
            <i className="fas fa-file-invoice"></i>
            {t('My Invoices')}
          </Link>
          <Link to="/client/payments" className="nav-item">
            <i className="fas fa-credit-card"></i>
            {t('Payments')}
          </Link>
          <Link to="/client/profile" className="nav-item active">
            <i className="fas fa-user"></i>
            {t('Profile')}
          </Link>
        </nav>

        <main className="client-main">
          <div className="profile-header">
            <h2>{t('Profile Settings')}</h2>
            <p>{t('Update your personal information and preferences')}</p>
          </div>

          {message && (
            <div className="message success">
              <i className="fas fa-check-circle"></i>
              {message}
            </div>
          )}

          {error && (
            <div className="message error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="profile-sections">
            {/* Personal Information */}
            <div className="profile-section">
              <h3>{t('Personal Information')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">{t('First Name')}</label>
                  <input
                    type="text"
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">{t('Last Name')}</label>
                  <input
                    type="text"
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('Email Address')}</label>
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    disabled
                    className="disabled"
                  />
                  <small>{t('Email cannot be changed')}</small>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">{t('Phone Number')}</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">{t('Company')}</label>
                  <input
                    type="text"
                    id="company"
                    value={profile.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="profile-section">
              <h3>{t('Address Information')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="street">{t('Street Address')}</label>
                  <input
                    type="text"
                    id="street"
                    value={profile.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">{t('City')}</label>
                  <input
                    type="text"
                    id="city"
                    value={profile.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">{t('State/Province')}</label>
                  <input
                    type="text"
                    id="state"
                    value={profile.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">{t('ZIP/Postal Code')}</label>
                  <input
                    type="text"
                    id="zipCode"
                    value={profile.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">{t('Country')}</label>
                  <input
                    type="text"
                    id="country"
                    value={profile.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="profile-section">
              <h3>{t('Preferences')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="language">{t('Language')}</label>
                  <select
                    id="language"
                    value={profile.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', 'language', e.target.value)}
                  >
                    <option value="en">{t('English')}</option>
                    <option value="ro">{t('Romanian')}</option>
                    <option value="de">{t('German')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="timezone">{t('Timezone')}</label>
                  <select
                    id="timezone"
                    value={profile.preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', 'timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/Bucharest">Europe/Bucharest</option>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="currency">{t('Currency')}</label>
                  <select
                    id="currency"
                    value={profile.preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', 'currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="RON">RON (lei)</option>
                  </select>
                </div>
              </div>

              <div className="notifications-section">
                <h4>{t('Notification Preferences')}</h4>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.email}
                      onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                    />
                    <span>{t('Email notifications')}</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.sms}
                      onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                    />
                    <span>{t('SMS notifications')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="profile-actions">
              <button
                onClick={handleSave}
                disabled={saving}
                className="save-btn"
              >
                {saving ? t('Saving...') : t('Save Changes')}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientProfile; 