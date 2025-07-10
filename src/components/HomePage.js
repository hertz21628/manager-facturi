import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.svg'; // Make sure the path to logo.svg is correct

function HomePage() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Welcome to your Invoicing and Contract Management System.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
      <nav style={{ marginTop: 20 }}>
        <Link to="/register" style={{ fontSize: '1.2rem', color: '#61dafb' }}>
          Get Started - Register Here
        </Link>
      </nav>
    </header>
  );
}

export default HomePage;