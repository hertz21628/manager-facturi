import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

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
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/clients" className="nav-link">Clients</Link>
          <Link to="/invoices" className="nav-link">Invoices</Link>
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
          <h1>Welcome to Your Dashboard</h1>
          <p>This is your central hub for managing all your invoicing and client needs. From here, you can create new invoices, manage your client list, and view the status of all your financial documents.</p>
        </header>
        <section className="features-grid">
          <Link to="/clients" className="feature-card">
            <h3 className="dashboard-th">Client Management</h3>
            <p className="dashboard-desc">Add, view, and organize your client information.</p>
          </Link>
          <Link to="/invoices/new" className="feature-card">
            <h3 className="dashboard-th">Invoice Creation</h3>
            <p className="dashboard-desc">Create and customize professional invoices in minutes.</p>
          </Link>
          <Link to="/invoices" className="feature-card">
            <h3 className="dashboard-th">Invoice List & Status</h3>
            <p className="dashboard-desc">Track the status of all your invoices, from sent to paid.</p>
          </Link>
          <Link to="/invoices/pdf" className="feature-card">
            <h3 className="dashboard-th">PDF Generation</h3>
            <p className="dashboard-desc">Generate and download PDF versions of your invoices.</p>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
