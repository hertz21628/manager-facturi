import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import ClientProtectedRoute from './components/auth/ClientProtectedRoute';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InvoiceCreation from './components/InvoiceCreation';
import InvoiceList from './components/InvoiceList';
import ClientManagement from './components/ClientManagement';
import PDFGeneration from './components/PDFGeneration';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ClientLogin from './components/ClientLogin';
import ClientRegister from './components/ClientRegister';
import ClientDashboard from './components/ClientDashboard';
import ClientInvoices from './components/ClientInvoices';
import ClientProfile from './components/ClientProfile';
import ClientPayments from './components/ClientPayments';
import AdminRoleManager from './components/AdminRoleManager';
import DebugAuth from './components/DebugAuth';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client/dashboard" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
          <Route path="/client/invoices" element={<ClientProtectedRoute><ClientInvoices /></ClientProtectedRoute>} />
          <Route path="/client/payments" element={<ClientProtectedRoute><ClientPayments /></ClientProtectedRoute>} />
          <Route path="/client/profile" element={<ClientProtectedRoute><ClientProfile /></ClientProtectedRoute>} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/invoices/new"
            element={
              <AdminProtectedRoute>
                <InvoiceCreation />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <AdminProtectedRoute>
                <InvoiceList />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/invoices/pdf"
            element={
              <AdminProtectedRoute>
                <PDFGeneration />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <AdminProtectedRoute>
                <ClientManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <AdminProtectedRoute>
                <Reports />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminProtectedRoute>
                <Settings />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <AdminProtectedRoute>
                <AdminRoleManager />
              </AdminProtectedRoute>
            }
          />
          <Route path="/debug" element={<DebugAuth />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;