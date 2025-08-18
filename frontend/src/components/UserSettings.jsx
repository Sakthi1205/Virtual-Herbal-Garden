import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/UserSettings.css';

// Use the same base resolution as other components
const RAW_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_BASE ? (RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`) : '/api';

const UserSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });
  const [settings, setSettings] = useState({ theme: 'light', fontSize: 'medium' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const toastTimerRef = useRef(null);

  // Token if using JWT auth; if using session cookies, this can be null
  const token = localStorage.getItem('token');

  const authHeaders = (extra = {}) => {
    const headers = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['Accept'] = 'application/json';
    return headers;
  };

  const applyAppearance = (s) => {
    const docEl = document.documentElement;
    const font = (s?.fontSize || 'medium').toLowerCase();
    // Only control font size; theme is fixed to light globally
    const sizeMap = { small: '14px', medium: '16px', large: '18px' };
    docEl.style.fontSize = sizeMap[font] || sizeMap.medium;
  };

  const showToast = (type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setMessage({ type, text });
    toastTimerRef.current = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 2500);
  };

  const parseJsonSafe = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        return await res.json();
      } catch (_) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let res = await fetch(`${API_BASE}/users/profile`, {
          credentials: 'include',
          headers: authHeaders(),
        });
        if (res.status === 401 && token) {
          // JWT likely expired; remove and retry with cookies only
          localStorage.removeItem('token');
          res = await fetch(`${API_BASE}/users/profile`, {
            credentials: 'include',
            headers: authHeaders(),
          });
        }
        if (!res.ok) {
          const errData = await parseJsonSafe(res);
          throw new Error((errData && errData.message) || 'Could not fetch profile.');
        }
        const data = await parseJsonSafe(res);
        if (!data) throw new Error('Empty response while fetching profile.');
        setUser({ name: data.name || data.username || '', email: data.email });
        setSettings(data.settings);
        // Apply appearance on initial load
        applyAppearance(data.settings);
      } catch (error) {
        showToast('error', error.message);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleProfileChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    const next = { ...settings, [e.target.name]: e.target.value };
    setSettings(next);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(user)
      });
      if (res.status === 401 && token) {
        localStorage.removeItem('token');
        res = await fetch(`${API_BASE}/users/profile`, {
          method: 'PUT',
          credentials: 'include',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(user)
        });
      }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error((data && data.message) || 'Failed to update profile.');
      showToast('success', 'Profile updated successfully!');
      if (data && (data.name || data.email)) {
        setUser({ name: data.name || '', email: data.email });
      }
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      // Invalidate session on server
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
      });
    } catch (_) { /* ignore network errors for logout */ }
    // Clear local auth artifacts and redirect
    localStorage.removeItem('token');
    showToast('success', 'Logged out');
    setTimeout(() => navigate('/'), 500);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch(`${API_BASE}/users/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(settings)
      });
      if (res.status === 401 && token) {
        localStorage.removeItem('token');
        res = await fetch(`${API_BASE}/users/settings`, {
          method: 'PUT',
          credentials: 'include',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(settings)
        });
      }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error((data && data.message) || 'Failed to update settings.');
      // Apply theme/font immediately and show a single toast
      applyAppearance(settings);
      showToast('success', 'Settings updated successfully!');
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch(`${API_BASE}/users/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(passwordData)
      });
      if (res.status === 401 && token) {
        localStorage.removeItem('token');
        res = await fetch(`${API_BASE}/users/password`, {
          method: 'PUT',
          credentials: 'include',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(passwordData)
        });
      }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error((data && data.message) || 'Failed to change password.');
      showToast('success', 'Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleDeleteAccount = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      let res = await fetch(`${API_BASE}/users/profile`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders(),
      });
      if (res.status === 401 && token) {
        localStorage.removeItem('token');
        res = await fetch(`${API_BASE}/users/profile`, {
          method: 'DELETE',
          credentials: 'include',
          headers: authHeaders(),
        });
      }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error((data && data.message) || 'Failed to delete account.');
      showToast('success', 'Account deleted successfully. Redirecting...');
      localStorage.removeItem('token');
      setShowConfirm(false);
      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      showToast('error', error.message);
      setShowConfirm(false);
    }
  };

// Basic styling (theme-aware via CSS variables)
const pageStyle = { padding: '2rem', maxWidth: '800px', margin: '2rem auto', color: 'var(--text)' };
const headerStyle = { color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' };
const sectionStyle = { margin: '2rem 0', padding: '2rem', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 8px var(--shadow-color)' };
const sectionTitleStyle = { color: 'var(--text)', marginTop: 0 };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const inputStyle = { padding: '0.8rem', borderRadius: '5px', border: '1px solid var(--border)', backgroundColor: 'var(--elevated)', color: 'var(--text)' };
const buttonStyle = { padding: '0.8rem', borderRadius: '5px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer', alignSelf: 'flex-start' };
const deleteButtonStyle = { ...buttonStyle, backgroundColor: 'var(--danger)' };
const messageStyle = { padding: '1rem', borderRadius: '5px', margin: '1rem 0', color: 'white' };
const successStyle = { ...messageStyle, backgroundColor: 'var(--primary-700)' };
const errorStyle = { ...messageStyle, backgroundColor: 'var(--danger)' };

return (
  <div style={pageStyle}>
    <h1 style={headerStyle}>User & Web Page Settings</h1>

    {message.text && (
      <div style={message.type === 'success' ? successStyle : errorStyle}>
        {message.text}
      </div>
    )}

    {/* Profile Settings */}
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Profile Settings</h2>
      <form style={formStyle} onSubmit={handleProfileSubmit}>
        <input type="text" name="name" value={user.name} onChange={handleProfileChange} style={inputStyle} placeholder="Name" />
        <input type="email" name="email" value={user.email} onChange={handleProfileChange} style={inputStyle} placeholder="Email" />
        <button type="submit" style={buttonStyle}>Save Profile</button>
      </form>
    </div>

    {/* Appearance Settings */}
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Appearance</h2>
      <form style={formStyle} onSubmit={handleSettingsSubmit}>
        <div>
          <label>Theme: </label>
          <select name="theme" value="light" disabled style={inputStyle}>
            <option value="light">Light (fixed)</option>
          </select>
        </div>
        <div>
          <label>Font Size: </label>
          <select name="fontSize" value={settings.fontSize} onChange={handleSettingsChange} style={inputStyle}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <button type="submit" style={buttonStyle}>Save Appearance</button>
      </form>
    </div>

    {/* Account Management */}
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Account Management</h2>
      <form style={formStyle} onSubmit={handlePasswordSubmit}>
        <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} style={inputStyle} placeholder="Old Password" />
        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} style={inputStyle} placeholder="New Password" />
        <button type="submit" style={buttonStyle}>Change Password</button>
      </form>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: 'var(--border)', color: 'var(--text)' }}>Log out</button>
        <button onClick={handleDeleteAccount} style={deleteButtonStyle}>Delete Account</button>
      </div>
    </div>

    {/* Confirm Delete Modal */}
    {showConfirm && (
      <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
        <div style={{background:'var(--surface)', color:'var(--text)', padding:'1.5rem', borderRadius:'10px', width:'min(420px, 92vw)', boxShadow:'0 10px 30px var(--shadow-color)', border:'1px solid var(--border)'}}>
          <h3 style={{marginTop:0, marginBottom:'0.5rem'}}>Confirm Account Deletion</h3>
          <p style={{marginBottom:'1rem', color:'var(--muted)'}}>This action cannot be undone. Are you sure you want to delete your account?</p>
          <div style={{display:'flex', gap:'0.75rem', justifyContent:'flex-end'}}>
            <button onClick={() => setShowConfirm(false)} style={{...buttonStyle, backgroundColor:'var(--border)'}}>Cancel</button>
            <button onClick={confirmDelete} style={deleteButtonStyle}>Delete</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default UserSettings;
