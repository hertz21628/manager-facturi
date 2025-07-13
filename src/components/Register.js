import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      console.log('Starting admin registration for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth user created:', userCredential.user.uid);
      
      // Save user role to Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userData = {
        name,
        email,
        role: 'admin',
        createdAt: new Date()
      };
      
      console.log('Creating user document with data:', userData);
      await setDoc(userDocRef, userData);
      
      // Verify the document was created
      const verifyDoc = await getDoc(userDocRef);
      console.log('User document created successfully:', verifyDoc.exists());
      console.log('User document data:', verifyDoc.data());
      
      console.log('Admin user registered:', userCredential.user);
      setSuccess('Registration successful! Please log in with your new admin account.');
      await auth.signOut();
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error("Error registering:", err.message);
      console.error("Error code:", err.code);
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-info">
        <h1>Admin Registration</h1>
        <p>Create your admin account to manage invoices, clients, and reports.</p>
      </div>
      <div className="register-form-container">
        <h2>Create Your Admin Account</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="register-button">Sign Up</button>
        </form>
        <div className="login-link">
          <p>Already have an admin account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;