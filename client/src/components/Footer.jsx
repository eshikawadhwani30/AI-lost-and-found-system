import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">FindIt AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              An intelligent, full-stack Lost & Found management platform empowering college campuses, workplaces, and public venues with seamless item tracking, verified claims, and AI-powered semantic matching.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BTech Final Year Capstone Project Standard</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/items?type=LOST" className="hover:text-indigo-600 transition">Lost Items Directory</Link></li>
              <li><Link to="/items?type=FOUND" className="hover:text-indigo-600 transition">Found Items Directory</Link></li>
              <li><Link to="/report" className="hover:text-indigo-600 transition">Report an Item</Link></li>
              <li><Link to="/about" className="hover:text-indigo-600 transition">About the System</Link></li>
            </ul>
          </div>

          {/* User & Security */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/login" className="hover:text-indigo-600 transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-indigo-600 transition">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-600 transition">User Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-600 transition">Profile & Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} FindIt AI. Built with MERN Stack + Google Gemini API.</p>
          <p className="flex items-center space-x-1">
            <span>Engineered with passion for Academic Demonstrations</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
