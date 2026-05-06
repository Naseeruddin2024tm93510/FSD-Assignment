import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchMyRequests();
    const interval = setInterval(fetchMyRequests, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await API.get('/borrow/my-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  const renderHierarchyProgress = (req) => {
    if (req.status === 'REJECTED') return <span style={{ color: 'var(--danger)' }}>Request Rejected</span>;
    if (req.status === 'RETURNED') return <span style={{ color: 'var(--primary)' }}>Equipment Returned</span>;
    if (req.status === 'APPROVED') return <span style={{ color: 'var(--success)' }}>Fully Approved</span>;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>
        <span style={{ 
          color: 'var(--warning)', 
          background: 'rgba(245, 158, 11, 0.1)', 
          padding: '2px 6px', 
          borderRadius: '4px' 
        }}>
          Currently at Level {req.currentStep}
        </span>
        <ChevronRight size={14} color="var(--text-muted)" />
        <span style={{ color: 'var(--text-muted)' }}>Waiting for Staff/Admin</span>
      </div>
    );
  };

  if (requests.length === 0) return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
      No borrowing history yet.
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Clock size={20} color="var(--primary)" /> My Borrowing History
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {requests.map(req => (
          <div key={req.id} style={{ 
            padding: '1.25rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{req.equipment?.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Requested on: {new Date(req.requestDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 
                              req.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: req.status === 'APPROVED' ? 'var(--success)' : 
                         req.status === 'PENDING' ? 'var(--warning)' : 'var(--danger)'
                }}>
                  {req.status}
                </span>
              </div>
            </div>
            {renderHierarchyProgress(req)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRequests;
