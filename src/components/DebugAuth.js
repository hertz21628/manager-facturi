import React from 'react';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <h2>🔍 Authentication Debug Info</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current User:</h3>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          {currentUser ? JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            displayName: currentUser.displayName
          }, null, 2) : 'No user logged in'}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>User Role:</h3>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          {userRole || 'No role assigned'}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Quick Actions:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Try Admin Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/client/dashboard'}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Try Client Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/admin/roles'}
            style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Role Manager
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Console Logs:</h3>
        <p>Check your browser console (F12) for detailed authentication logs.</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Firebase Console:</h3>
        <p>Check your Firestore Database → users collection to see if user documents exist.</p>
      </div>
    </div>
  );
};

export default DebugAuth; 