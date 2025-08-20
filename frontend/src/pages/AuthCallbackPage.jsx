import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateUser = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');

      if (!token || !userParam) {
        setError('Invalid authentication response. Missing required parameters.');
        setIsLoading(false);
        return;
      }

      try {
        // Store the token
        localStorage.setItem('token', token);
        
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Update auth context
        setUser(user);
        setIsAuthenticated(true);
        
        // Redirect to dashboard or intended URL
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        navigate(redirectTo);
      } catch (error) {
        console.error('Error processing authentication:', error);
        setError('Failed to process authentication. Please try again.');
        navigate('/login', { 
          state: { 
            error: 'Authentication failed. Please try again.' 
          } 
        });
      } finally {
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Completing authentication...</h2>
          <p className="text-gray-600 mt-2">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
