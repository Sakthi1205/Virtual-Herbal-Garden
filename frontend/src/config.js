// Frontend configuration
const config = {
  // Base URL for API requests - prefer VITE_BACKEND_URL, fallback to VITE_API_URL
  backendUrl: import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // API endpoints
  api: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      me: '/api/users/profile',
      google: '/api/auth/google',
      googleCallback: '/api/auth/google/callback'
    },
    plants: '/api/plants',
    notes: '/api/notes',
    quizzes: '/api/quizzes',
    models: '/api/models',
    images: '/api/images'
  },
  
  // Cookie settings
  cookieOptions: {
    path: '/',
    secure: import.meta.env.PROD, // Only send over HTTPS in production
    sameSite: import.meta.env.DEV ? 'lax' : 'none',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
};

// Log the current configuration in development
if (import.meta.env.DEV) {
  console.log('Current configuration:', {
    mode: import.meta.env.MODE,
    backendUrl: config.backendUrl,
    api: config.api
  });
}

export default config;
