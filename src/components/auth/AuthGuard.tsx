import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('AuthGuard: user =', user?.id, 'loading =', loading);

  useEffect(() => {
    console.log('AuthGuard: Effect running, user =', user?.id, 'loading =', loading);
    if (!loading && !user) {
      console.log('AuthGuard: Redirecting to auth page');
      // Save the attempted URL to redirect back after login
      navigate('/auth', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [user, loading, navigate, location]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
};