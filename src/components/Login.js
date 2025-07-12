import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Register.css';

const Login = () => {
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
      console.log('Starting admin login for:', email);
      
      // First, authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase auth successful for user:', user.uid);
      
      // Then check their role
      const userDocRef = doc(db, 'users', user.uid);
      console.log('Checking user document at:', userDocRef.path);
      
      const userDoc = await getDoc(userDocRef);
      
      console.log('User document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        
        console.log('User data:', userData);
        console.log('User role:', role);
        
        if (role === 'admin') {
          console.log('Admin login successful, navigating to dashboard');
          // Admin login successful
      navigate('/dashboard');
        } else {
          console.log('User role is not admin:', role);
          // Client trying to access admin portal
          setError('Access denied. This portal is for administrators only. Please use the client portal instead.');
          // Sign out the user since they shouldn't be logged in
          await auth.signOut();
        }
      } else {
        console.log('User document does not exist in Firestore');
        // User document doesn't exist, treat as client
        setError('Access denied. This portal is for administrators only. Please use the client portal instead.');
        await auth.signOut();
      }
    } catch (err) {
      console.error("Error logging in:", err.message);
      console.error("Error code:", err.code);
      
      // Handle specific Firebase auth errors
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
        <h1>Welcome to the Admin Portal!</h1>
        <p>Log in to manage invoices, clients, and reports.</p>
      </div>
      <div className="register-form-container">
        <h2>Admin Login</h2>
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
          <p>Don't have an admin account? <Link to="/register">Sign Up</Link></p>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Are you a client? <Link to="/client/login" style={{ color: '#1976d2' }}>Login to Client Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;