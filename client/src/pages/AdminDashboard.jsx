import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Users, 
  Package, 
  FileCheck, 
  FolderPlus, 
  RefreshCw, 
  Search, 
  Check, 
  X, 
  Trash2, 
  ExternalLink,
  Tag,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'items', 'claims', 'categories'

  // Data States
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [claimsList, setClaimsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Filter State
  const [userSearch, setUserSearch] = useState('');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Claim Comment State
  const [adminComments, setAdminComments] = useState({});

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes, claimsRes, catsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items'),
        api.get('/claims'),
        api.get('/categories'),
      ]);

      setStats(statsRes.data.data);
      setUsersList(usersRes.data.data?.users || []);
      setItemsList(itemsRes.data.data?.items || []);
      setClaimsList(claimsRes.data.data?.claims || []);
      setCategoriesList(catsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Change User Role
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate / soft-delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Moderate Item (Delete)
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item from public view?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  // Review Claim
  const handleReviewClaim = async (claimId, status) => {
    const comment = adminComments[claimId] || '';
    try {
      await api.put(`/claims/${claimId}/status`, { status, adminComment: comment });
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim status');
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      await api.post('/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      setNewCatName('');
      setNewCatDesc('');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCatLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${catId}`);
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const metrics = stats?.metrics;
  const analytics = stats?.analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Admin Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                Staff Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live statistics, user administration, item moderation, and claims verification.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllAdminData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 5 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium flex items-center">
            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Total Users
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.users || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium flex items-center">
            <Package className="w-3.5 h-3.5 mr-1 text-rose-500" /> Lost Items
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{metrics?.items?.lost || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium flex items-center">
            <Package className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Found Items
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics?.items?.found || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> Claims Pending
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">{metrics?.claims?.pending || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-purple-600" /> Claims Approved
          </span>
          <p className="text-2xl font-black text-purple-600 mt-1">{metrics?.claims?.approved || 0}</p>
        </div>
      </div>

      {/* Visual Analytics Bar (Lost vs Found & Claim Status Distributions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ratio 1: Lost vs Found Ratio */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-600" />
              Lost vs Found Inventory
            </span>
            <span className="text-xs text-slate-400 font-semibold">{metrics?.items?.total || 0} Total Items</span>
          </div>

          {/* Visual Progress Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${
                  metrics?.items?.total
                    ? (metrics.items.lost / metrics.items.total) * 100
                    : 50
                }%`,
              }}
              className="bg-rose-500 h-full"
              title="Lost"
            ></div>
            <div
              style={{
                width: `${
                  metrics?.items?.total
                    ? (metrics.items.found / metrics.items.total) * 100
                    : 50
                }%`,
              }}
              className="bg-emerald-500 h-full"
              title="Found"
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center text-rose-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span>
              Lost: {metrics?.items?.lost || 0} ({metrics?.items?.total ? Math.round((metrics.items.lost / metrics.items.total) * 100) : 0}%)
            </span>
            <span className="flex items-center text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Found: {metrics?.items?.found || 0} ({metrics?.items?.total ? Math.round((metrics.items.found / metrics.items.total) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Ratio 2: Claims by Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-purple-600" />
              Claim Verification Funnel
            </span>
            <span className="text-xs text-slate-400 font-semibold">{metrics?.claims?.total || 0} Total Claims</span>
          </div>

          {/* Visual Progress Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${
                  metrics?.claims?.total
                    ? (metrics.claims.approved / metrics.claims.total) * 100
                    : 0
                }%`,
              }}
              className="bg-purple-600 h-full"
              title="Approved"
            ></div>
            <div
              style={{
                width: `${
                  metrics?.claims?.total
                    ? (metrics.claims.pending / metrics.claims.total) * 100
                    : 0
                }%`,
              }}
              className="bg-amber-400 h-full"
              title="Pending"
            ></div>
            <div
              style={{
                width: `${
                  metrics?.claims?.total
                    ? (metrics.claims.rejected / metrics.claims.total) * 100
                    : 0
                }%`,
              }}
              className="bg-rose-400 h-full"
              title="Rejected"
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-purple-700 font-bold">Approved: {metrics?.claims?.approved || 0}</span>
            <span className="text-amber-700 font-bold">Pending: {metrics?.claims?.pending || 0}</span>
            <span className="text-rose-700 font-bold">Rejected: {metrics?.claims?.rejected || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Administrative Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Activity
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'claims'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Claims Desk ({metrics?.claims?.pending || 0} Pending)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'items'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Item Moderation ({itemsList.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'categories'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Category Management ({categoriesList.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Inventory Distribution by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {analytics?.itemsByCategory?.map((cat) => (
                  <div key={cat._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                    <span className="text-xs font-black text-indigo-600 px-2 py-0.5 rounded-lg bg-indigo-50">
                      {cat.count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Recent Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Recently Reported Items</h4>
                <div className="space-y-2">
                  {stats?.recentActivity?.items?.map((it) => (
                    <div key={it._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className={`font-bold mr-2 ${it.type === 'LOST' ? 'text-rose-600' : 'text-emerald-600'}`}>[{it.type}]</span>
                        <span className="font-semibold text-slate-800">{it.title}</span>
                      </div>
                      <Link to={`/items/${it._id}`} className="text-indigo-600 hover:underline flex items-center space-x-1">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Claims */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Recently Filed Claims</h4>
                <div className="space-y-2">
                  {stats?.recentActivity?.claims?.map((cl) => (
                    <div key={cl._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{cl.item?.title || 'Item'}</span>
                        <span className="text-slate-400 block text-[10px]">Claimed by: {cl.claimant?.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        cl.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        cl.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {cl.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3">User Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Joined Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3.5 px-3 text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        {u._id !== user?._id && (
                          <>
                            <button
                              onClick={() => handleRoleChange(u._id, u.role)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-white text-indigo-600 font-semibold"
                            >
                              Toggle Role ({u.role === 'ADMIN' ? 'Demote' : 'Promote'})
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Deactivate User"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ITEM MODERATION */}
        {activeTab === 'items' && (
          <div className="space-y-3">
            {itemsList.map((it) => (
              <div key={it._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      it.type === 'LOST' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {it.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{it.category?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      Status: {it.status}
                    </span>
                    {it.isDeleted && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">
                        SOFT DELETED
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{it.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{it.description}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Reported by: {it.user?.name} ({it.user?.email}) • Location: {it.location}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/items/${it._id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white"
                  >
                    View
                  </Link>
                  {!it.isDeleted && (
                    <button
                      onClick={() => handleDeleteItem(it._id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Soft Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CLAIMS MODERATION DESK */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            {claimsList.map((cl) => (
              <div key={cl._id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      cl.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      cl.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      ● {cl.status}
                    </span>
                    <span className="font-bold text-sm text-slate-900">Claim for: {cl.item?.title}</span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Submitted on {new Date(cl.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <p><strong>Claimant:</strong> {cl.claimant?.name} ({cl.claimant?.email})</p>
                  <p><strong>Claimant Explanation:</strong> {cl.message}</p>
                  <p><strong>Secret Ownership Proof:</strong> <span className="text-purple-700 font-mono font-semibold">{cl.proof || 'None provided'}</span></p>
                </div>

                {cl.adminComment && (
                  <p className="text-xs text-slate-500">
                    <strong>Recorded Admin Feedback:</strong> "{cl.adminComment}"
                  </p>
                )}

                {cl.status === 'PENDING' && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Add an admin comment or verification note..."
                      value={adminComments[cl._id] || ''}
                      onChange={(e) => setAdminComments({ ...adminComments, [cl._id]: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleReviewClaim(cl._id, 'APPROVED')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReviewClaim(cl._id, 'REJECTED')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Sports Equipment)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={catLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                + Add Category
              </button>
            </form>

            {/* Existing Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoriesList.map((cat) => (
                <div key={cat._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{cat.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Soft Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
