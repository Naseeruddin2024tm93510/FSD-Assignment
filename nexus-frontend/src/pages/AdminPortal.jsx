import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../api/axios';
import { Plus, Check, X, RefreshCw, Trash2, Edit3, Package, Users, ShieldCheck, ListOrdered, MessageSquare, UserCheck, Calendar, Clock, Info, ChevronRight, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [hierarchySteps, setHierarchySteps] = useState([]);
  const [rejectionComment, setRejectionComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', totalQuantity: 1, availableQuantity: 1, conditionStatus: 'GOOD'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const hasModal = showItemModal || showHierarchyModal || showRejectModal;
    if (hasModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showItemModal, showHierarchyModal, showRejectModal]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'requests') {
        const res = await API.get('/borrow/all-requests');
        setRequests(res.data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)));
      } else if (activeTab === 'inventory') {
        const res = await API.get('/equipment');
        setInventory(res.data);
      } else if (activeTab === 'users') {
        const res = await API.get('/admin/users/pending');
        setPendingUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await API.put(`/borrow/approve/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data || 'Failed to approve');
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/borrow/reject/${selectedRequest.id}`, { rejectionRemarks: rejectionComment });
      setShowRejectModal(false);
      setRejectionComment('');
      fetchData();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleApproveUser = async (id) => {
    await API.put(`/admin/users/approve/${id}`);
    fetchData();
  };

  const handleHierarchySetup = async (e) => {
    e.preventDefault();
    await API.post(`/admin/hierarchy/${selectedItem.id}`, hierarchySteps);
    setShowHierarchyModal(false);
    alert('Approval hierarchy updated successfully!');
  };

  const addStep = () => {
    setHierarchySteps([...hierarchySteps, { requiredRole: 'STAFF' }]);
  };

  const removeStep = (index) => {
    setHierarchySteps(hierarchySteps.filter((_, i) => i !== index));
  };

  const updateStep = (index, role) => {
    const newSteps = [...hierarchySteps];
    newSteps[index].requiredRole = role;
    setHierarchySteps(newSteps);
  };

  const fetchHierarchy = async (item) => {
    setSelectedItem(item);
    try {
      const res = await API.get(`/equipment/${item.id}/hierarchy`);
      setHierarchySteps(res.data.length > 0 ? res.data : [{ requiredRole: 'STAFF' }]);
      setShowHierarchyModal(true);
    } catch (err) {
      setHierarchySteps([{ requiredRole: 'STAFF' }]);
      setShowHierarchyModal(true);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await API.put(`/equipment/${editingItem.id}`, formData);
      } else {
        await API.post('/equipment', formData);
      }
      setShowItemModal(false);
      setFormData({ name: '', category: '', description: '', totalQuantity: 1, availableQuantity: 1, conditionStatus: 'GOOD' });
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data || 'Failed to save equipment');
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
            Management Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Admin and Lab Administrator control center for oversight and inventory.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-light)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <button 
            className={activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'} 
            onClick={() => setActiveTab('requests')}
            style={{ padding: '8px 16px', borderRadius: '12px', border: 'none' }}
          >
            <Users size={16} /> Requests
          </button>
          {(user?.role === 'ADMIN' || user?.role === 'LAB_ADMIN') && (
            <>
              <button 
                className={activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'} 
                onClick={() => setActiveTab('inventory')}
                style={{ padding: '8px 16px', borderRadius: '12px', border: 'none' }}
              >
                <Package size={16} /> Inventory
              </button>
              <button 
                className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} 
                onClick={() => setActiveTab('users')}
                style={{ padding: '8px 16px', borderRadius: '12px', border: 'none' }}
              >
                <ShieldCheck size={16} /> Users
              </button>
            </>
          )}
        </div>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '8rem 0' }}><RefreshCw className="animate-spin" size={48} color="var(--primary)" /></div>
      ) : (
        <>
          {activeTab === 'requests' && (
            <div className="glass-card animate-fade" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Requestor</th>
                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Item & Purpose</th>
                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Timeline</th>
                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Approval Flow</th>
                    <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No requests found in the system.</td></tr>
                  ) : requests.map(req => {
                    const isOverdue = req.status === 'APPROVED' && new Date(req.returnDate) < new Date();
                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border)', background: isOverdue ? 'rgba(239, 68, 68, 0.02)' : 'transparent', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', background: 'var(--surface-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{req.user?.username?.charAt(0).toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: '700' }}>{req.user?.username}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>{req.user?.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{req.equipment?.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.remarks}</div>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="var(--text-muted)" /> {new Date(req.requestDate).toLocaleDateString()}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOverdue ? 'var(--danger)' : 'inherit' }}><Clock size={14} color={isOverdue ? 'var(--danger)' : 'var(--text-muted)'} /> {new Date(req.returnDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', background: 'var(--surface-light)', padding: '2px 8px', borderRadius: '6px' }}>Step {req.currentStep}</span>
                              <span className={`badge ${isOverdue ? 'badge-danger' : `badge-${req.status.toLowerCase()}`}`}>
                                {isOverdue ? 'OVERDUE' : req.status}
                              </span>
                            </div>
                            {req.approvedBy && <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><UserCheck size={12} /> {req.approvedBy}</div>}
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {req.status === 'PENDING' && (
                              <>
                                <button onClick={() => handleApproveRequest(req.id)} className="btn-primary" style={{ padding: '8px', minWidth: '40px' }} title="Approve"><Check size={18} /></button>
                                <button onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', minWidth: '40px' }} title="Reject"><X size={18} /></button>
                              </>
                            )}
                            {req.status === 'APPROVED' && (
                              <button onClick={() => API.put(`/borrow/return/${req.id}`).then(fetchData)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Mark Returned</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Pending Registration Approvals</h3>
                <p style={{ color: 'var(--text-muted)' }}>Review and approve new user accounts to grant access to the portal.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {pendingUsers.length === 0 ? (
                  <div className="glass-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>All user registration requests have been processed.</div>
                ) : pendingUsers.map(u => (
                  <div key={u.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--primary-gradient)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>{u.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{u.username}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{u.role}</div>
                      </div>
                    </div>
                    <button onClick={() => handleApproveUser(u.id)} className="btn-primary" style={{ padding: '10px 20px' }}>
                      <Check size={18} /> Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Equipment Inventory</h3>
                <button className="btn-primary" onClick={() => { setShowItemModal(true); setEditingItem(null); }}><Plus size={20} /> Add New Equipment</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {inventory.map(item => (
                  <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.category}</div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{item.name}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{item.availableQuantity}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>of {item.totalQuantity}</div>
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem', height: '2.7em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => fetchHierarchy(item)} className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}><ListOrdered size={16} /> Workflow</button>
                        <button onClick={() => { setEditingItem(item); setFormData(item); setShowItemModal(true); }} className="btn-secondary" style={{ padding: '10px' }}><Edit3 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals with consistent styling */}
      {showHierarchyModal && createPortal(
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '550px', position: 'relative' }}>
            <button onClick={() => setShowHierarchyModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}><X size={24} /></button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Approval Workflow</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure the sequence of roles required to approve requests for <strong>{selectedItem.name}</strong>.</p>
            
            <form onSubmit={handleHierarchySetup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {hierarchySteps.map((step, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--surface-light)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{index + 1}</div>
                    <select value={step.requiredRole} onChange={(e) => updateStep(index, e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent' }}>
                      <option value="STAFF">Staff (Teacher)</option>
                      <option value="LAB_ADMIN">Lab Administrator</option>
                      <option value="ADMIN">System Admin</option>
                    </select>
                    <button type="button" onClick={() => removeStep(index)} style={{ background: 'transparent', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                  </div>
                ))}
                <button type="button" onClick={addStep} className="btn-secondary" style={{ borderStyle: 'dashed' }}><Plus size={18} /> Add Approval Step</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowHierarchyModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Workflow</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showRejectModal && createPortal(
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '450px', position: 'relative' }}>
             <button onClick={() => setShowRejectModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}><X size={24} /></button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Reject Request</h3>
            <form onSubmit={handleRejectRequest}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Reason for Rejection</label>
                <textarea 
                  required 
                  style={{ minHeight: '120px' }} 
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  placeholder="Provide a reason to inform the student why their request was declined..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'var(--danger)', color: 'white', borderRadius: '12px', fontWeight: '700' }}>Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showItemModal && createPortal(
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '0', width: '90%', maxWidth: '600px', position: 'relative', overflow: 'hidden' }}>
            {/* Modal Header with Gradient Background */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0, 77, 61, 0.08) 0%, rgba(0, 102, 82, 0.08) 100%)', padding: '2.5rem', borderBottom: '1px solid var(--border)' }}>
              <button 
                onClick={() => setShowItemModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', color: 'var(--text)', width: '32px', height: '32px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--primary-gradient)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0, 77, 61, 0.2)' }}>
                  <Package size={28} color="white" />
                </div>
                <div>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Inventory Management</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)' }}>{editingItem ? 'Edit Equipment' : 'Add New Item'}</h2>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '2.5rem' }}>
              <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Equipment Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Sony DSLR Camera" 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Category</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      placeholder="e.g. Tech, Lab" 
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Provide technical specifications or usage guidelines..." 
                    style={{ minHeight: '100px', resize: 'none' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Total Qty</label>
                    <input 
                      type="number" 
                      min="1" 
                      required 
                      value={formData.totalQuantity} 
                      onChange={(e) => setFormData({...formData, totalQuantity: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Available</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={formData.totalQuantity} 
                      required 
                      value={formData.availableQuantity} 
                      onChange={(e) => setFormData({...formData, availableQuantity: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Condition</label>
                    <select value={formData.conditionStatus} onChange={(e) => setFormData({...formData, conditionStatus: e.target.value})}>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowItemModal(false)} className="btn-secondary" style={{ flex: 1, height: '54px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2, height: '54px', fontSize: '1rem' }}>
                    {editingItem ? 'Update Equipment' : 'Create Equipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPortal;
