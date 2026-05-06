import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, LayoutDashboard, History, Settings, LogOut, LogIn, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'STAFF', 'LAB_ADMIN', 'ADMIN'] },
    { path: '/history', label: 'My History', icon: History, roles: ['STUDENT', 'STAFF', 'LAB_ADMIN', 'ADMIN'] },
    { path: '/admin', label: 'Management', icon: Settings, roles: ['STAFF', 'LAB_ADMIN', 'ADMIN'] },
  ];

  const filteredLinks = navLinks.filter(link => !link.roles || (user && link.roles.includes(user.role)));

  return (
    <nav className="navbar" style={{
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      background: 'var(--glass)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        textDecoration: 'none',
        color: 'var(--text)',
        fontSize: '1.25rem',
        fontWeight: '800',
        letterSpacing: '-0.02em'
      }}>
        <div style={{
          background: 'var(--primary-gradient)',
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Package color="white" size={24} />
        </div>
        <span className="brand-text">BITS <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>| Equipment Portal</span></span>
      </Link>

      {/* Desktop Navigation */}
      <div className="nav-desktop" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            {filteredLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <div style={{ height: '24px', width: '1px', background: 'var(--border)', margin: '0 0.5rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="nav-user-info">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.username}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px' }}>
                <LogOut size={18} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Join Now</Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="nav-mobile-toggle" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ display: 'none', background: 'transparent', color: 'var(--text)' }}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--background)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 999
        }}>
          {user ? (
            <>
              <div style={{ padding: '1rem', background: 'var(--surface-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                  <User color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.role}</div>
                </div>
              </div>
              {filteredLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--text)', fontSize: '1.1rem', fontWeight: '500' }}
                >
                  <link.icon size={22} color="var(--primary)" />
                  {link.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '1.2rem', textAlign: 'center' }}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 12px;
          border-radius: 10px;
        }
        .nav-link:hover {
          color: var(--text);
          background: var(--border);
        }
        .nav-link.active {
          color: var(--primary);
          background: rgba(0, 77, 61, 0.08);
        }
        .nav-user-info {
          display: none;
        }
        @media (min-width: 1024px) {
          .nav-user-info {
            display: block;
          }
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
          .brand-text { font-size: 1rem; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
