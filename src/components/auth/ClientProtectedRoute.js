import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ClientProtectedRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();

  console.log('ClientProtectedRoute - currentUser:', currentUser?.email, 'userRole:', userRole);

  if (!currentUser) {
    return <Navigate to="/client/login" />;
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

  if (userRole !== 'client') {
    console.log('Non-client user trying to access client route, redirecting to client login');
    return <Navigate to="/client/login" />;
  }

  return children;
};

export default ClientProtectedRoute; 