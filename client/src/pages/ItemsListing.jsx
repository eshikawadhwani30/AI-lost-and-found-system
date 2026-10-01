import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import ClaimModal from '../components/ClaimModal';
import { 
  Search, 
  X, 
  RefreshCw, 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal 
} from 'lucide-react';

export default function ItemsListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state initialized from query params if available
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [limitPerPage, setLimitPerPage] = useState(6);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingItem, setClaimingItem] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch items with filters
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      params.append('sort', sortBy);
      params.append('page', currentPage);
      params.append('limit', limitPerPage);

      // Keep browser URL synchronized
      setSearchParams(params);

      const res = await api.get(`/items?${params.toString()}`);
      setItems(res.data.data?.items || []);
      setPagination(res.data.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, selectedType, selectedCategory, sortBy, currentPage, limitPerPage]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {selectedType === 'LOST' ? 'Lost Items Directory' : selectedType === 'FOUND' ? 'Found Items Directory' : 'All Lost & Found Items'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying <strong>{items.length}</strong> of <strong>{pagination.totalItems}</strong> matching records
          </p>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-semibold shadow-xs">
          {['ALL', 'LOST', 'FOUND'].map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedType(t); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl transition ${
                selectedType === t
                  ? t === 'LOST'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : t === 'FOUND'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by keyword, brand, description, location..."
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full lg:w-auto"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
          className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full lg:w-auto"
        >
          <option value="newest">Recently Reported</option>
          <option value="oldest">Oldest Reported</option>
          <option value="date-desc">Incident Date (Newest)</option>
          <option value="title-asc">Item Name (A to Z)</option>
        </select>

        {(searchQuery || selectedType !== 'ALL' || selectedCategory !== 'ALL') && (
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading items catalog...
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onClaimClick={(it) => setClaimingItem(it)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No items match your search.</p>
          <p className="text-xs text-slate-400 mt-1">Try relaxing filters or searching for different keywords.</p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span className="text-slate-500">
          Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalItems} records)
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition ${
                  pagination.currentPage === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Claim Modal */}
      {claimingItem && (
        <ClaimModal
          item={claimingItem}
          onClose={() => setClaimingItem(null)}
          onSuccess={() => fetchItems()}
        />
      )}
    </div>
  );
}
