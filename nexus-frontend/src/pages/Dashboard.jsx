import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, Info, CheckCircle2, AlertTriangle, Users, Package, ChevronRight, X, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';
import MyRequests from '../components/MyRequests';

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeHierarchy, setActiveHierarchy] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({
    returnDate: '',
    remarks: '',
    staffId: ''
  });

  useEffect(() => {
    fetchItems();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showModal]);

  const fetchItems = async () => {
    try {
      const res = await API.get('/equipment');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items');
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await API.get('/users/staff');
      setStaffMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch staff');
    }
  };

  const handleOpenRequestModal = async (item) => {
    setSelectedItem(item);
    try {
      const res = await API.get(`/equipment/${item.id}/hierarchy`);
      setActiveHierarchy(res.data);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch hierarchy');
      setActiveHierarchy([]);
      setShowModal(true);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    
    const requiresStaff = activeHierarchy.some(step => step.requiredRole === 'STAFF') || 
                         (activeHierarchy.length === 0 && user.role === 'STUDENT');

    if (requiresStaff && !requestData.staffId) {
      alert('Please select a teacher for approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        returnDate: requestData.returnDate, // YYYY-MM-DD string
        remarks: requestData.remarks,
        designatedStaffApprover: requestData.staffId ? { id: parseInt(requestData.staffId) } : null
      };
      await API.post(`/borrow/request/${selectedItem.id}`, payload);
      setShowModal(false);
      setRequestData({ returnDate: '', remarks: '', staffId: '' });
      fetchItems();
      alert('Request submitted successfully!');
    } catch (err) {
      alert(err.response?.data || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['All', ...new Set(items.map(item => item.category))];
  const filteredItems = items.filter(item => 
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!showAvailableOnly || item.availableQuantity > 0)
  );

  const needsStaffSelection = activeHierarchy?.some(step => step.requiredRole === 'STAFF') || 
                             (activeHierarchy?.length === 0 && user?.role === 'STUDENT');

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
          Resource Catalog
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
          Explore our wide range of equipment. Select an item to view details and submit a borrowing request.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search items, categories, or brands..." 
            style={{ paddingLeft: '3.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', alignItems: 'center', flexWrap: 'nowrap' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ whiteSpace: 'nowrap', padding: '10px 18px', borderRadius: '12px' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text)', cursor: 'pointer', marginLeft: '1rem', whiteSpace: 'nowrap', userSelect: 'none' }}>
          <div style={{ position: 'relative', width: '44px', height: '24px' }}>
            <input 
              type="checkbox" 
              checked={showAvailableOnly} 
              onChange={(e) => setShowAvailableOnly(e.target.checked)} 
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: showAvailableOnly ? 'var(--primary)' : 'var(--surface-light)',
              transition: '.4s', borderRadius: '34px', border: '1px solid var(--border)'
            }}></span>
            <span style={{
              position: 'absolute', height: '18px', width: '18px', left: showAvailableOnly ? '22px' : '3px', bottom: '2px',
              backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
            }}></span>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Available Only</span>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        {filteredItems.map(item => (
          <div key={item.id} className="glass-card animate-fade" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              height: '140px', 
              background: 'linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderBottom: '1px solid var(--border)',
              position: 'relative'
            }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '20px', 
                background: 'rgba(99, 102, 241, 0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center' 
              }}>
                <Package size={40} color="var(--primary)" style={{ opacity: 0.8 }} />
              </div>
              <span className={item.availableQuantity > 0 ? 'badge badge-success' : 'badge badge-danger'} style={{ 
                position: 'absolute', top: '1.25rem', right: '1.25rem',
              }}>
                {item.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{item.category}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>{item.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>{item.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Quantity</span>
                  <div style={{ fontSize: '1.1rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text)' }}>{item.availableQuantity}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / {item.totalQuantity}</span>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  disabled={item.availableQuantity <= 0}
                  onClick={() => handleOpenRequestModal(item)}
                  style={{ padding: '10px 24px' }}
                >
                  Request Item
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '0', width: '90%', maxWidth: '600px', position: 'relative', overflow: 'hidden' }}>
            {/* Modal Header with Gradient Background */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0, 77, 61, 0.08) 0%, rgba(0, 102, 82, 0.08) 100%)', padding: '2.5rem', borderBottom: '1px solid var(--border)' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', width: '32px', height: '32px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--primary-gradient)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' }}>
                  <Package size={28} color="white" />
                </div>
                <div>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Borrowing Request</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)' }}>{selectedItem?.name}</h2>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '2.5rem' }}>
              {/* Progress Stepper for Hierarchy */}
              {activeHierarchy.length > 0 ? (
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} /> Approval Path
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeHierarchy.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div style={{ 
                          flex: 1, 
                          padding: '10px', 
                          background: 'var(--surface-light)', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border)',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: 'var(--text)'
                        }}>
                          {step.requiredRole.replace('_', ' ')}
                        </div>
                        {idx < activeHierarchy.length - 1 && <ChevronRight size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '2.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Info size={18} color="var(--primary)" />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {user?.role === 'STUDENT' ? 'This item requires approval from a teacher and lab admin.' : 'Standard approval process applies for this item.'}
                  </div>
                </div>
              )}

              <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Expected Return Date</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                      <input 
                        type="date" 
                        required 
                        style={{ paddingLeft: '3rem', minHeight: '50px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
                        value={requestData.returnDate}
                        onChange={(e) => setRequestData({...requestData, returnDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {needsStaffSelection && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Select Approving Teacher</label>
                      <div style={{ position: 'relative' }}>
                        <UserCheck size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                        <select 
                          required 
                          style={{ paddingLeft: '3rem', minHeight: '50px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
                          value={requestData.staffId}
                          onChange={(e) => setRequestData({...requestData, staffId: e.target.value})}
                        >
                          <option value="">-- Choose Teacher --</option>
                          {staffMembers.map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.username}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Purpose of Request</label>
                  <textarea 
                    placeholder="Briefly explain why you need this equipment..."
                    style={{ minHeight: '100px', resize: 'none', padding: '1rem' }}
                    value={requestData.remarks}
                    onChange={(e) => setRequestData({...requestData, remarks: e.target.value})}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, height: '54px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2, height: '54px', fontSize: '1rem' }} disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {(user.role === 'STUDENT' || user.role === 'STAFF') && <MyRequests />}
    </div>
  );
};

export default Dashboard;
