import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Register.css';
import { useTranslation } from 'react-i18next';

const ClientRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user role to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role: 'client',
        createdAt: new Date()
      });
      
      console.log('Client user registered:', userCredential.user);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.message);
      console.error("Error registering client:", err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-info">
        <h1>{t('Client Portal Registration')}</h1>
        <p>{t('Sign up to access your invoices, payment history, and update your profile.')}</p>
      </div>
      <div className="register-form-container">
        <h2>{t('Create Your Client Account')}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">{t('Full Name')}</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('Email Address')}</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('Password')}</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="register-button">{t('Sign Up')}</button>
        </form>
        <div className="login-link">
          <p>{t('Already have a client account?')} <Link to="/client/login">{t('Log In')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister; 