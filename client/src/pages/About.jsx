import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Database, Server, Code2, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>About FindIt AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Next-Generation Lost & Found Platform
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Designed and engineered as a production-grade full-stack web application combining the MERN stack with Google Gemini AI semantic intelligence.
        </p>
      </div>

      {/* Mission & Problem Statement */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Project Mission & Objectives</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Traditional lost-and-found desks in educational institutions, office parks, and transit hubs rely on physical notebooks, messy bulletin boards, or fragmented WhatsApp and Facebook groups. This leads to unclaimed items, identity theft risks, and high return failure rates.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong>FindIt AI</strong> solves this through a unified digital platform:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-800">Secure Authentication:</strong>
              <p className="text-slate-500 mt-0.5">JWT tokens, Bcrypt encryption, and Role-Based Access Control (RBAC).</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-800">Verified Claim Workflow:</strong>
              <p className="text-slate-500 mt-0.5">Confidential proof submission with human administrator moderation.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-800">Server-Side Search:</strong>
              <p className="text-slate-500 mt-0.5">Multi-field indexing, category filters, and fast offset pagination.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-800">Google Gemini AI Engine:</strong>
              <p className="text-slate-500 mt-0.5">Natural language matching between lost reports and found items.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Technical Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800">Frontend Tier</h4>
            <p className="text-slate-500 leading-relaxed">
              React 18, Vite, Tailwind CSS, Lucide Icons, Axios with Interceptors, React Router DOM v6.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800">Backend Tier</h4>
            <p className="text-slate-500 leading-relaxed">
              Node.js, Express.js REST API, Multer file upload storage, CORS, Centralized Error Middlewares.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800">Database & AI</h4>
            <p className="text-slate-500 leading-relaxed">
              MongoDB with Mongoose ODM, Soft-Delete hooks, Compound text indexes, Google Gemini 1.5 API.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
        <strong className="block font-bold">Academic & Demonstration Project Disclaimer:</strong>
        <p className="text-amber-800 leading-relaxed">
          AI-assisted matches generated by Google Gemini are advisory recommendations and do not constitute absolute legal proof of property ownership. Handover of high-value items must always be verified and approved by an authorized human administrator.
        </p>
      </div>
    </div>
  );
}
