import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  FileCheck, 
  PlusCircle, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'claims'

  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        api.get('/items/my'),
        api.get('/claims/my'),
      ]);

      setMyItems(itemsRes.data.data?.items || []);
      setMyClaims(claimsRes.data.data?.claims || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this reported item?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const lostCount = myItems.filter((i) => i.type === 'LOST').length;
  const foundCount = myItems.filter((i) => i.type === 'FOUND').length;
  const pendingClaims = myClaims.filter((c) => c.status === 'PENDING').length;
  const approvedClaims = myClaims.filter((c) => c.status === 'APPROVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
            Personal Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your reported lost/found belongings and track your claims.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/report?type=LOST"
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition"
          >
            + Report Lost
          </Link>
          <Link
            to="/report?type=FOUND"
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
          >
            + Report Found
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">My Lost Reports</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{lostCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">My Found Reports</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{foundCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Claims Pending</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{pendingClaims}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Approved Claims</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{approvedClaims}</p>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {/* Tab Headers */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'items'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Reported Items ({myItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'claims'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>My Submitted Claims ({myClaims.length})</span>
          </button>
        </div>

        {/* Tab Content: Reported Items */}
        {activeTab === 'items' && (
          <div>
            {loading ? (
              <div className="text-center py-16 text-slate-400 text-xs">Loading items...</div>
            ) : myItems.length > 0 ? (
              <div className="space-y-3">
                {myItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                              item.type === 'LOST' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">{item.category?.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                            {item.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.location} • Reported on {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <Link
                        to={`/items/${item._id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white transition flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">You haven't reported any items yet.</p>
                <div className="mt-3 flex justify-center space-x-2">
                  <Link to="/report?type=LOST" className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold">
                    Report Lost
                  </Link>
                  <Link to="/report?type=FOUND" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                    Report Found
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Submitted Claims */}
        {activeTab === 'claims' && (
          <div>
            {loading ? (
              <div className="text-center py-16 text-slate-400 text-xs">Loading claims...</div>
            ) : myClaims.length > 0 ? (
              <div className="space-y-3">
                {myClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            claim.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : claim.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          ● Status: {claim.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {claim.item && (
                        <Link
                          to={`/items/${claim.item._id}`}
                          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
                        >
                          <span>View Item</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1">
                        Claimed Item: {claim.item?.title || 'Unknown Item'}
                      </h4>
                      <p className="text-xs text-slate-600"><strong>My Claim Reason:</strong> {claim.message}</p>
                      {claim.proof && (
                        <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                          <strong>My Ownership Proof:</strong> {claim.proof}
                        </p>
                      )}
                    </div>

                    {claim.adminComment && (
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                        <p><strong>Admin Review Feedback:</strong> "{claim.adminComment}"</p>
                        {claim.reviewedBy && (
                          <p className="text-[10px] text-indigo-600">Reviewed by: {claim.reviewedBy.name}</p>
                        )}
                      </div>
                    )}

                    {claim.status === 'APPROVED' && claim.item?.user && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <p className="font-bold text-emerald-900 flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 flex-shrink-0" />
                          🎉 Claim Approved! Physical Handover Contact Details:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                          <div><strong>Finder Name:</strong> {claim.item.user.name}</div>
                          <div><strong>Email:</strong> {claim.item.user.email}</div>
                          <div><strong>Phone:</strong> {claim.item.user.phone || 'Provided on campus'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">You have not submitted any claims yet.</p>
                <Link to="/items?type=FOUND" className="mt-3 inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                  Browse Found Items to Claim
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
