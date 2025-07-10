import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    // Handle registration logic here
    console.log({
      name,
      email,
      password,
    });
  };

  return (
    <div className="register-container">
      <div className="register-info">
        <h1>Streamline Your Invoicing and Contracts</h1>
        <p>
          Join us to simplify your financial workflows and manage your contracts with ease.
        </p>
      </div>
      <div className="register-form-container">
        <h2>Create Your Account</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          <button type="submit" className="register-button">
            Sign Up
          </button>
        </form>
        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Log In</Link> {/* Changed href to Link */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;