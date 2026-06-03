'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/app/actions';
import SubmitButton from './SubmitButton';

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, {});
  const [selectedRole, setSelectedRole] = useState('seller');
  const [email, setEmail] = useState('seller@example.com');
  const [password, setPassword] = useState('Seller@12345');

  const selectRole = (role) => {
    setSelectedRole(role);
    if (role === 'seller') {
      setEmail('seller@example.com');
      setPassword('Seller@12345');
    } else if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@12345');
    } else if (role === 'buyer') {
      setEmail('buyer@example.com');
      setPassword('Buyer@12345');
    }
  };

  return (
    <form action={action} className="stack">
      {/* Email Input */}
      <div className="login-form-group">
        <label htmlFor="email">Email Address</label>
        <div className="login-input-wrapper">
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!['seller@example.com', 'admin@example.com', 'buyer@example.com'].includes(e.target.value)) {
                setSelectedRole('');
              }
            }}
            placeholder="Enter your email"
            required
          />
          <span className="login-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
        </div>
      </div>

      {/* Password Input */}
      <div className="login-form-group">
        <label htmlFor="password">Password</label>
        <div className="login-input-wrapper">
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!['Seller@12345', 'Admin@12345', 'Buyer@12345'].includes(e.target.value)) {
                setSelectedRole('');
              }
            }}
            placeholder="Enter your password"
            required
          />
          <span className="login-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        </div>
      </div>

      {/* Error Message */}
      {state?.error ? (
        <div className="login-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
        </div>
      ) : null}

      <SubmitButton className="login-submit-btn" pendingText="Verifying details...">
        Sign In
      </SubmitButton>

      {/* Demo Credentials Box */}
      <div className="demo-credentials-box">
        <div className="demo-cred-title">Demo Credentials (Click to Autofill)</div>
        <div className="demo-cred-grid">
          {/* Seller */}
          <button
            type="button"
            className={`demo-cred-item ${selectedRole === 'seller' ? 'active' : ''}`}
            onClick={() => selectRole('seller')}
          >
            <span className="role-badge seller">Seller</span>
            <div className="cred-details">
              <div className="cred-row">
                <span className="cred-label">Email:</span>
                <span className="cred-val">seller@example.com</span>
              </div>
              <div className="cred-row">
                <span className="cred-label">Password:</span>
                <span className="cred-val">Seller@12345</span>
              </div>
            </div>
          </button>

          {/* Admin */}
          <button
            type="button"
            className={`demo-cred-item ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => selectRole('admin')}
          >
            <span className="role-badge admin">Admin</span>
            <div className="cred-details">
              <div className="cred-row">
                <span className="cred-label">Email:</span>
                <span className="cred-val">admin@example.com</span>
              </div>
              <div className="cred-row">
                <span className="cred-label">Password:</span>
                <span className="cred-val">Admin@12345</span>
              </div>
            </div>
          </button>

          {/* Buyer */}
          <button
            type="button"
            className={`demo-cred-item ${selectedRole === 'buyer' ? 'active' : ''}`}
            onClick={() => selectRole('buyer')}
          >
            <span className="role-badge buyer">Buyer</span>
            <div className="cred-details">
              <div className="cred-row">
                <span className="cred-label">Email:</span>
                <span className="cred-val">buyer@example.com</span>
              </div>
              <div className="cred-row">
                <span className="cred-label">Password:</span>
                <span className="cred-val">Buyer@12345</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </form>
  );
}
