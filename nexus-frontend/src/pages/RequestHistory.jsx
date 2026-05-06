import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Clock, CheckCircle, XCircle, ChevronRight, Ban, AlertCircle, RefreshCw, UserCheck, CalendarDays, Filter, X } from 'lucide-react';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [extendDate, setExtendDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (showExtendModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showExtendModal]);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/borrow/my-requests');
      setRequests(res.data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)));
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await API.put(`/borrow/cancel/${id}`);
        fetchHistory();
      } catch (err) {
        alert(err.response?.data || 'Failed to cancel');
      }
    }
  };

  const handleExtend = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.put(`/borrow/extend/${selectedReq.id}`, { extendedReturnDate: extendDate });
      setShowExtendModal(false);
      fetchHistory();
      alert('Extension requested successfully! Waiting for approval.');
    } catch (err) {
      alert(err.response?.data || 'Failed to request extension');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status, isOverdue) => {
    if (isOverdue) return 'badge-danger';
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'RETURNED': return 'badge-success';
      case 'CANCELLED': return 'badge-pending';
      default: return 'badge-pending';
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0', gap: '1rem' }}>
      <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
      <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading your history...</p>
    </div>
  );

  const filteredRequests = requests.filter(req => {
    const isOverdue = req.status === 'APPROVED' && new Date(req.returnDate) < new Date();
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'OVERDUE') return isOverdue;
    return req.status === filterStatus;
  });

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
          Request History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Track all your current and past equipment requests and their approval status.</p>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>
          <Filter size={16} /> Filter By:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'OVERDUE'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface-light)', padding: '24px', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Clock size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No records found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You haven't made any requests matching this criteria yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredRequests.map(req => {
            const isOverdue = req.status === 'APPROVED' && new Date(req.returnDate) < new Date();
            const badgeClass = getStatusBadgeClass(req.status, isOverdue);
            
            return (
              <div key={req.id} className="glass-card animate-fade" style={{ 
                padding: '2rem', 
                border: isOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {isOverdue && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--danger)' }} />}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{req.equipment.name}</h3>
                      <span className={`badge ${badgeClass}`}>
                        {isOverdue ? 'OVERDUE' : req.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Requested On</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                          <CalendarDays size={16} color="var(--primary)" />
                          {new Date(req.requestDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Expected Return</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                          <Clock size={16} color={isOverdue ? 'var(--danger)' : 'var(--primary)'} />
                          {new Date(req.returnDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {req.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancel(req.id)}
                        className="btn-secondary"
                        style={{ color: 'var(--danger)', fontSize: '0.9rem' }}
                      >
                        <Ban size={18} /> Cancel
                      </button>
                    )}
                    {req.status === 'APPROVED' && !req.extensionRequested && (
                      <button 
                        onClick={() => { setSelectedReq(req); setShowExtendModal(true); }}
                        className="btn-secondary"
                        style={{ color: 'var(--primary)', fontSize: '0.9rem' }}
                      >
                        <RefreshCw size={18} /> Extend
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Purpose</div>
                    <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>{req.remarks || "No remarks provided."}</div>
                  </div>
                  
                  {req.designatedStaffApprover && (
                    <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.04)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Assigned Faculty</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {req.designatedStaffApprover.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{req.designatedStaffApprover.username}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level 1 Approver</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  {req.approvedBy ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem' }}>
                      <UserCheck size={18} />
                      <span>
                        Approved by <strong>{req.approvedBy}</strong> ({req.approverRole})
                        {req.approvedAt && ` • ${new Date(req.approvedAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  ) : req.status === 'PENDING' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.05)', padding: '8px 16px', borderRadius: '12px' }}>
                      <Clock size={16} />
                      <span>Awaiting Step {req.currentStep} Approval</span>
                    </div>
                  ) : null}

                  {req.rejectionRemarks && (
                    <div style={{ width: '100%', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Rejection Reason</div>
                      <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text)' }}>"{req.rejectionRemarks}"</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showExtendModal && selectedReq && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '2.5rem', width: '90%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setShowExtendModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}><X size={24} /></button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Request Extension</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Current return date: <strong>{new Date(selectedReq.returnDate).toLocaleDateString()}</strong>
            </p>
            <form onSubmit={handleExtend} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>New Expected Return Date</label>
                <input 
                  type="date" 
                  required 
                  value={extendDate}
                  onChange={(e) => setExtendDate(e.target.value)}
                  min={new Date(selectedReq.returnDate).toISOString().split('T')[0]}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowExtendModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Confirm Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
