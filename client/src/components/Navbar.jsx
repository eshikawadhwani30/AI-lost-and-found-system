import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Menu, 
  X, 
  PlusCircle, 
  User, 
  LogOut, 
  Shield, 
  FileCheck, 
  LayoutDashboard,
  Search,
  Bot
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">FindIt AI</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Lost & Found System</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/items?type=LOST" className={navLinkClass}>
            Lost Items
          </NavLink>
          <NavLink to="/items?type=FOUND" className={navLinkClass}>
            Found Items
          </NavLink>
          <NavLink to="/ai-match" className={navLinkClass}>
            <span className="flex items-center space-x-1 text-purple-600 font-bold">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Matcher</span>
            </span>
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            <span className="flex items-center space-x-1 text-indigo-600 font-bold">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Item</span>
            </span>
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <NavLink
                to="/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                <span>Dashboard</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin Panel</span>
                </NavLink>
              )}

              {/* User Pill */}
              <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs text-indigo-700">
                <Link to="/profile" className="flex items-center space-x-1 hover:underline">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold">{user?.name}</span>
                </Link>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-200 text-indigo-900 font-bold uppercase">
                  {user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-600 ml-1 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </NavLink>
          <NavLink
            to="/items?type=LOST"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Lost Items
          </NavLink>
          <NavLink
            to="/items?type=FOUND"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Found Items
          </NavLink>
          <NavLink
            to="/ai-match"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold text-purple-700 bg-purple-50"
          >
            🤖 AI Semantic Matcher
          </NavLink>
          <NavLink
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold text-indigo-600 bg-indigo-50"
          >
            + Report Lost/Found Item
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            About
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile Settings ({user?.name})
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-purple-700 bg-purple-50"
                >
                  Admin Panel
                </NavLink>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
