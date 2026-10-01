import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Upload, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';

export default function ReportItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [type, setType] = useState(searchParams.get('type') || 'LOST');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        const cats = res.data.data || [];
        setCategories(cats);
        if (cats.length > 0) setCategory(cats[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('date', date);
      formData.append('description', description);
      formData.append('tags', tags);
      if (file) {
        formData.append('image', file);
      }

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdItem = res.data.data;
      navigate(`/items/${createdItem._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please check required fields.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100">
        <div className="mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report an Item</h1>
              <p className="text-xs text-slate-500">Provide accurate details to assist item recovery</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle: LOST vs FOUND */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Report Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('LOST')}
                className={`py-3 px-4 rounded-2xl text-xs font-extrabold border transition ${
                  type === 'LOST'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm ring-2 ring-rose-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🔴 I LOST Something (Owner)
              </button>
              <button
                type="button"
                onClick={() => setType('FOUND')}
                className={`py-3 px-4 rounded-2xl text-xs font-extrabold border transition ${
                  type === 'FOUND'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🟢 I FOUND Something (Finder)
              </button>
            </div>
          </div>

          {/* Item Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black Samsung Galaxy S23 Phone"
              className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Date of Incident <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Location Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Library, 2nd Floor study cubicle #14"
              className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe distinguishing marks, brand, case, color, wallpaper, scratches, or unique features..."
              className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tags <span className="text-slate-400 font-normal">(Comma-separated keywords)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. samsung, phone, black, galaxy, cracked"
              className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Photo Upload with Live Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Photograph <span className="text-slate-400 font-normal">(Recommended)</span>
            </label>

            {previewUrl ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-indigo-50/30 transition">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Click to upload an image</span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-6 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 ${
              type === 'LOST'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Publishing Report...' : `Publish ${type} Item Report`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
