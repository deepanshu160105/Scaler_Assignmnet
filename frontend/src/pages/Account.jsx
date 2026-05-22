import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { authApi } from '../api/authApi';
import { addressApi } from '../api/addressApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';

const EMPTY_ADDR = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '', country: 'India',
};

export default function Account() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab]             = useState('profile');
  const [editing, setEditing]     = useState(false);
  const [profile, setProfile]     = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving]       = useState(false);

  const [addresses, setAddresses]     = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrModal, setShowAddrModal]   = useState(false);
  const [editingAddr, setEditingAddr]       = useState(null); // null = add new, object = editing
  const [addrForm, setAddrForm]             = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr]         = useState(false);

  useEffect(() => {
    if (tab === 'addresses') loadAddresses();
  }, [tab]);

  const loadAddresses = () => {
    setAddrLoading(true);
    addressApi.getAddresses()
      .then(res => setAddresses(res.data.data?.addresses || []))
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  };

  // ── Profile ────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateMe(profile);
      // Backend returns: { data: { user: {...} } }
      updateUser(res.data.data?.user);
      setEditing(false);
      showToast('Profile updated!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update profile', 'error');
    } finally { setSaving(false); }
  };

  // ── Add or Edit Address ───────────────────
  const openAddAddress = () => {
    setEditingAddr(null);
    setAddrForm(EMPTY_ADDR);
    setShowAddrModal(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddr(addr);
    setAddrForm({
      fullName:     addr.fullName,
      phone:        addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city:         addr.city,
      state:        addr.state,
      pincode:      addr.pincode,
      country:      addr.country || 'India',
    });
    setShowAddrModal(true);
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      if (editingAddr) {
        // PUT /api/addresses/:id
        const res = await addressApi.updateAddress(editingAddr.id, addrForm);
        const updated = res.data.data?.address;
        setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a));
        showToast('Address updated!', 'success');
      } else {
        // POST /api/addresses
        const res = await addressApi.addAddress(addrForm);
        const added = res.data.data?.address;
        setAddresses(prev => [...prev, added]);
        showToast('Address added!', 'success');
      }
      setShowAddrModal(false);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save address', 'error');
    } finally { setSavingAddr(false); }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefault(id);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      showToast('Default address updated', 'success');
    } catch { showToast('Failed to update default', 'error'); }
  };

  const handleDeleteAddr = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Address deleted', 'info');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete address', 'error');
    }
  };

  const TABS = [
    { id: 'profile',   label: 'Login & Security', icon: <FiUser /> },
    { id: 'addresses', label: 'Your Addresses',   icon: <FiMapPin /> },
    { id: 'orders',    label: 'Your Orders',       icon: <FiPackage />, href: '/orders' },
    { id: 'wishlist',  label: 'Lists',             icon: <FiHeart />,   href: '/wishlist' },
  ];

  return (
    <div className="container page-content">
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 400, marginBottom: 20 }}>Your Account</h1>

      <div className="account-layout">
        {/* ── Sidebar ──────────────────────────────────── */}
        <nav className="account-sidebar">
          {TABS.map(t =>
            t.href
              ? <Link key={t.id} to={t.href} className="account-sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.icon} {t.label}
                </Link>
              : <button
                  key={t.id}
                  className={`account-sidebar-link ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {t.icon} {t.label}
                </button>
          )}
        </nav>

        {/* ── Content ──────────────────────────────────── */}
        <div>
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 'var(--text-xl)' }}>Login & Security</h2>
                {!editing
                  ? <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
                      <FiEdit2 /> Edit
                    </button>
                  : <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving} id="save-profile-btn">
                        <FiSave /> {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setProfile({ name: user?.name || '', phone: user?.phone || '' }); }}>
                        <FiX />
                      </button>
                    </div>
                }
              </div>

              <div style={{ display: 'grid', gap: 20 }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg-light)', borderRadius: 8 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--amazon-navy)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 700, flexShrink: 0,
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    {editing
                      ? <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 6 }} placeholder="Full name" />
                      : <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{user?.name}</p>
                    }
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{user?.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: 4 }}>Phone Number</label>
                  {editing
                    ? <input
                        className="input"
                        value={profile.phone}
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 XXXXX XXXXX"
                        style={{ maxWidth: 300 }}
                      />
                    : <p style={{ color: user?.phone ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: user?.phone ? 'normal' : 'italic' }}>
                        {user?.phone || 'Not provided'}
                      </p>
                  }
                </div>

                {/* Member since */}
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: 4 }}>Member Since</label>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {tab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 'var(--text-xl)' }}>Your Addresses</h2>
                <button className="btn btn-outline btn-sm" onClick={openAddAddress} id="add-addr-account-btn">
                  <FiPlus /> Add Address
                </button>
              </div>

              {addrLoading
                ? <div className="spinner-center"><Spinner /></div>
                : addresses.length === 0
                  ? <div className="empty-state">
                      <div className="empty-state-icon">📍</div>
                      <h3>No saved addresses</h3>
                      <p>Add an address for faster checkout.</p>
                    </div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {addresses.map(addr => (
                        <div key={addr.id} style={{ border: `2px solid ${addr.isDefault ? 'var(--amazon-orange)' : 'var(--border)'}`, borderRadius: 8, padding: 16 }}>
                          {addr.isDefault && <div className="badge badge-orange" style={{ marginBottom: 8 }}>Default</div>}
                          <strong>{addr.fullName}</strong>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.7 }}>
                            {addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br />
                            {addr.city}, {addr.state} – {addr.pincode}<br />
                            {addr.phone}
                          </p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            <button className="btn btn-link btn-sm" onClick={() => openEditAddress(addr)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiEdit2 size={12} /> Edit
                            </button>
                            {!addr.isDefault && (
                              <button className="btn btn-link btn-sm" onClick={() => handleSetDefault(addr.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiStar size={12} /> Set Default
                              </button>
                            )}
                            <button className="btn btn-link btn-sm" style={{ color: 'var(--btn-danger)', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleDeleteAddr(addr.id)}>
                              <FiTrash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
              }
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={showAddrModal}
        onClose={() => setShowAddrModal(false)}
        title={editingAddr ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmitAddress}>
          <div className="address-form-grid">
            <div className="input-group span-2">
              <label className="input-label">Full Name *</label>
              <input className="input" required value={addrForm.fullName} onChange={e => setAddrForm(a => ({ ...a, fullName: e.target.value }))} />
            </div>
            <div className="input-group span-2">
              <label className="input-label">Phone *</label>
              <input className="input" required value={addrForm.phone} onChange={e => setAddrForm(a => ({ ...a, phone: e.target.value }))} />
            </div>
            <div className="input-group span-2">
              <label className="input-label">Address Line 1 *</label>
              <input className="input" required value={addrForm.addressLine1} onChange={e => setAddrForm(a => ({ ...a, addressLine1: e.target.value }))} placeholder="House No, Street, Area" />
            </div>
            <div className="input-group span-2">
              <label className="input-label">Address Line 2</label>
              <input className="input" value={addrForm.addressLine2} onChange={e => setAddrForm(a => ({ ...a, addressLine2: e.target.value }))} placeholder="Landmark (optional)" />
            </div>
            <div className="input-group">
              <label className="input-label">City *</label>
              <input className="input" required value={addrForm.city} onChange={e => setAddrForm(a => ({ ...a, city: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">State *</label>
              <input className="input" required value={addrForm.state} onChange={e => setAddrForm(a => ({ ...a, state: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Pincode *</label>
              <input className="input" required value={addrForm.pincode} onChange={e => setAddrForm(a => ({ ...a, pincode: e.target.value }))} maxLength={6} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={savingAddr} id="save-address-btn">
              {savingAddr ? 'Saving…' : editingAddr ? 'Save Changes' : 'Add Address'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddrModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
