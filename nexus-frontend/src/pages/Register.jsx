import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, Lock, User as UserIcon, UserCircle, Check, ArrowRight, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await API.post('/auth/signup', formData);
      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Check if username exists.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)', padding: '20px' }}>
        <div className="glass-card animate-fade" style={{ padding: '3.5rem', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '24px', background: 'var(--success)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
          }}>
            <Check size={48} color="white" strokeWidth={3} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Registration Successful!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Your account request has been submitted. An administrator will review your application shortly. You'll be able to log in once approved.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', height: '52px' }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade" style={{ padding: '3rem', width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--primary-gradient)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            background: 'var(--primary-gradient)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Sparkles color="white" size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Join the Portal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create your account to start borrowing equipment</p>
        </div>
        
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--danger)', 
            color: 'var(--danger)', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Choose a unique username"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="yourname@bits.edu"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Minimum 8 characters"
                style={{ paddingLeft: '2.75rem' }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Join As</label>
            <div style={{ position: 'relative' }}>
              <UserCircle size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                style={{ paddingLeft: '2.75rem' }}
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff (Teacher)</option>
                <option value="LAB_ADMIN">Lab Administrator</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', height: '52px' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register Now'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
