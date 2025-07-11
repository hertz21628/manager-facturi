import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Register.css';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check their role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        if (role === 'client') {
          // Client login successful
          navigate('/client/dashboard');
        } else {
          // Admin trying to access client portal
          setError('Access denied. This portal is for clients only. Please use the admin portal instead.');
          await auth.signOut();
        }
      } else {
        // User document doesn't exist, treat as not a client
        setError('Access denied. This portal is for clients only. Please use the admin portal instead.');
        await auth.signOut();
      }
    } catch (err) {
      console.error("Error logging in client:", err.message);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-info">
        <h1>Welcome to the Client Portal!</h1>
        <p>Log in to view your invoices, payment history, and update your profile.</p>
      </div>
      <div className="register-form-container">
        <h2>Client Portal Login</h2>
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            textAlign: 'center', 
            backgroundColor: '#ffebee', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="register-button" 
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div className="login-link">
          <p>Don't have a client account? <Link to="/client/register">Sign Up</Link></p>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Are you an admin? <Link to="/login" style={{ color: '#1976d2' }}>Login to Admin Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin; 