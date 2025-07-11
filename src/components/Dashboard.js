import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>InvoiceApp</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link active">{t('Dashboard')}</Link>
          <Link to="/clients" className="nav-link">{t('Clients')}</Link>
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
          <h1>{t('Dashboard')}</h1>
          <p>{t('DashboardDesc') || ''}</p>
        </header>
        <section className="features-grid">
          <Link to="/clients" className="feature-card">
            <h3 className="dashboard-th">{t('Client Management')}</h3>
            <p className="dashboard-desc">{t('Add, view, and organize your client information.')}</p>
          </Link>
          <Link to="/invoices/new" className="feature-card">
            <h3 className="dashboard-th">{t('Invoice Creation')}</h3>
            <p className="dashboard-desc">{t('Create and customize professional invoices in minutes.')}</p>
          </Link>
          <Link to="/invoices" className="feature-card">
            <h3 className="dashboard-th">{t('Invoice List & Status')}</h3>
            <p className="dashboard-desc">{t('Track the status of all your invoices, from sent to paid.')}</p>
          </Link>
          <Link to="/invoices/pdf" className="feature-card">
            <h3 className="dashboard-th">{t('PDF Generation')}</h3>
            <p className="dashboard-desc">{t('Generate and download PDF versions of your invoices.')}</p>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
