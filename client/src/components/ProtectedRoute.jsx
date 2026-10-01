import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Verifying your security credentials...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login page with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin rights and user is not an admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-600 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Access Restricted (403 Forbidden)</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Your current account role is <strong className="text-slate-800 font-mono">{user?.role}</strong>. You need an <strong className="text-purple-700 font-mono">ADMIN</strong> account to view this administration desk.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
}
