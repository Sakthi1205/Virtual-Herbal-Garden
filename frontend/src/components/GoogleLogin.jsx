import React, { useState } from 'react';
import config from '../config';

import '../styles/GoogleLogin.css';

export default function GoogleLogin({ label = 'Continue with Google', width = 260 }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    try {
      setLoading(true);
      // Redirect to backend's Google OAuth endpoint using proxy
      window.location.href = `/api/auth/google`;
    } catch (_) {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="google-btn"
      style={{ width }}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.11 32.658 29.005 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.983 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.464 16.108 18.815 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.983 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c4.945 0 9.485-1.894 12.926-4.987l-5.972-5.049C29.005 36 24 36 24 36c-5.005 0-9.11-3.342-10.697-7.917l-6.571 5.059C9.656 39.663 16.318 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.098 3.415-3.645 6.209-6.974 7.873l.006-.004 5.972 5.049C36.982 41.091 44 36 44 24c0-1.341-.138-2.651-.389-3.917z"/>
      </svg>
      <span className="google-label">{loading ? 'Redirecting…' : label}</span>
    </button>
  );
}
