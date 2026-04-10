// Frontend configuration

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// ✅ Backend URL Logic
// - In development → use Vite proxy (no backend URL needed)
// - In production → use environment backend URL
const backendUrl = isProd
  ? (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL)
  : ""; // ✅ IMPORTANT: empty in dev so proxy works

const config = {
  backendUrl,

  // ✅ API endpoints
  api: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      me: "/api/users/profile",
      google: "/api/auth/google",
      googleCallback: "/api/auth/google/callback",
    },

    plants: "/api/plants",
    notes: "/api/notes",
    quizzes: "/api/quizzes",
    models: "/api/models",
    images: "/api/images",

    // ✅ Added summarize endpoint
    summarize: "/api/summarize",
  },

  // ✅ Cookie settings
  cookieOptions: {
    path: "/",
    secure: isProd, // HTTPS only in production
    sameSite: isDev ? "lax" : "none",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// ✅ Debug log in development
if (isDev) {
  console.log("🔧 Current configuration:", {
    mode: import.meta.env.MODE,
    backendUrl: config.backendUrl,
    usingProxy: true,
    api: config.api,
  });
}

export default config;