import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('sending');
      // TODO: Implement newsletter subscription endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="newsletter-container">
      <h3>Stay Informed</h3>
      <p>Get the latest government news delivered to your inbox</p>
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="newsletter-input"
        />
        <button 
          type="submit" 
          className={`newsletter-button ${status}`}
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Subscribing...' : 
           status === 'success' ? 'Subscribed!' : 
           'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="error-message">Something went wrong. Please try again.</p>
      )}
    </div>
  );
};

export default Newsletter;
