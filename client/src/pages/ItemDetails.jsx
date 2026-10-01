import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClaimModal from '../components/ClaimModal';
import AiMatchModal from '../components/AiMatchModal';
import { 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  Image as ImageIcon,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot
} from 'lucide-react';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item record?')) return;
    setDeleting(true);
    try {
      await api.delete(`/items/${id}`);
      navigate('/items');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Item Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">{error || 'This item may have been removed or does not exist.'}</p>
        <Link
          to="/items"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && item.user && (user._id === item.user._id || user._id === item.user);
  const canModify = isOwner || isAdmin;
  const isFound = item.type === 'FOUND';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/items"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Items Directory</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* AI Match Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-200 transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Match Finder</span>
          </button>

          {canModify && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Image */}
        <div className="md:col-span-6 bg-slate-100 min-h-[320px] md:min-h-[460px] flex items-center justify-center relative p-4">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[420px] w-full object-contain rounded-2xl"
            />
          ) : (
            <div className="text-center text-slate-400">
              <ImageIcon className="w-16 h-16 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="text-xs">No photograph provided for this item</p>
            </div>
          )}

          <div className="absolute top-4 left-4 flex space-x-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-sm ${
                item.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {item.type}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-xs shadow-sm">
              {item.category?.name || 'General'}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${
                item.status === 'CLAIMED' ? 'bg-purple-600 text-white' :
                item.status === 'CLAIM_PENDING' ? 'bg-amber-500 text-white' :
                'bg-blue-600 text-white'
              }`}
            >
              Status: {item.status}
            </span>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                {item.category?.name || 'Item Information'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {item.description}
              </p>
            </div>

            {/* Incident Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Location
                </span>
                <span className="font-semibold text-slate-800">{item.location}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Incident Date
                </span>
                <span className="font-semibold text-slate-800">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1 text-indigo-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reporter Contact Information */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <h4 className="font-bold text-slate-800 flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Reported By: {item.user?.name || 'Anonymous User'}
              </h4>
              <p className="text-slate-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Posted on {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {/* AI Match Button Secondary */}
            <button
              onClick={() => setShowAiModal(true)}
              className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Scan Catalog for Matches using Google Gemini AI</span>
            </button>

            {isFound && item.status !== 'CLAIMED' && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setShowClaimModal(true);
                  }
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center justify-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>This is Mine — File Ownership Claim</span>
              </button>
            )}
          </div>

          {item.status === 'CLAIMED' && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>This item has been officially claimed and verified by campus administration.</span>
            </div>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          item={item}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => fetchItemDetails()}
        />
      )}

      {/* Gemini AI Match Modal */}
      {showAiModal && (
        <AiMatchModal
          item={item}
          onClose={() => setShowAiModal(false)}
          onClaimClick={(targetItem) => {
            setItem(targetItem);
            setShowClaimModal(true);
          }}
        />
      )}
    </div>
  );
}
