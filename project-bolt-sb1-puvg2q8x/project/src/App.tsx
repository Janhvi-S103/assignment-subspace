import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import supabase from './lib/supabase';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';

// Component to protect routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        setIsAuthenticated(true);
        setSession(data.session);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
        setSession(session);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? React.cloneElement(children as React.ReactElement, { session }) : <Navigate to="/login" replace />;
}

function App() {
  // Get the basename from the GitHub Pages URL
  // This is necessary for GitHub Pages to work with React Router
  const basename = process.env.NODE_ENV === 'production' 
    ? '/your-repo-name' // Replace with your actual GitHub repository name
    : '';
    
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard session={null} /></AuthGuard>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;