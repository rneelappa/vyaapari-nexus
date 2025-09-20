import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth state change event:', event, 'session:', !!session, 'user:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('AuthProvider: Setting loading to false (signed in/refreshed)');
          setLoading(false);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: Setting loading to false (signed out)');
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthProvider: Initial session:', !!session, 'user:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('AuthProvider: Error getting session:', error);
      } finally {
        console.log('AuthProvider: Setting loading to false (initial session check complete)');
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};