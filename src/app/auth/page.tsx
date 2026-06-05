'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Spotlight hover effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-default)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'var(--primary)',
        filter: 'blur(100px)',
        opacity: 0.15,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'var(--violet)',
        filter: 'blur(100px)',
        opacity: 0.15,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="glass-card auth-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'rgba(20, 20, 25, 0.7)',
          backdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
      >
        <div className="auth-card-content" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              letterSpacing: '-0.02em', 
              marginBottom: '12px',
              color: 'var(--text-primary)'
            }}>
              Welcome back
            </h1>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              padding: '0 10px'
            }}>
              Paper trading is on by default. Live trading requires explicit setup.
            </p>
          </div>

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input" 
                placeholder="Enter your email"
                required
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input" 
                placeholder="Enter your password"
                required
                style={{ width: '100%' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                marginTop: '8px', 
                height: '44px',
                position: 'relative',
                overflow: 'hidden'
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Don't have an account? <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .auth-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(
            600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            rgba(255, 255, 255, 0.4),
            transparent 40%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .auth-card:hover::before {
          opacity: 1;
        }
        .auth-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            rgba(255, 255, 255, 0.06),
            transparent 40%
          );
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .auth-card:hover::after {
          opacity: 1;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
