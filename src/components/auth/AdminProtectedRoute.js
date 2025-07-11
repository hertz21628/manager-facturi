import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();

  console.log('AdminProtectedRoute - currentUser:', currentUser?.email, 'userRole:', userRole);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If user has no role yet, show a loading message
  if (userRole === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Loading user permissions...</h2>
        <p>Please wait while we set up your account.</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    console.log('Non-admin user trying to access admin route, redirecting to admin login');
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminProtectedRoute; 