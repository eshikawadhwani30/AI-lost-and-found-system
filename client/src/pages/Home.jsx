import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import ClaimModal from '../components/ClaimModal';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Package, 
  CheckCircle2, 
  FileText,
  MapPin
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [recentItems, setRecentItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, lostCount: 0, foundCount: 0 });
  const [loading, setLoading] = useState(true);
  const [claimingItem, setClaimingItem] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          api.get('/items?limit=6&sort=newest'),
          api.get('/categories'),
        ]);

        const allItems = itemsRes.data.data?.items || [];
        setRecentItems(allItems);
        setCategories(catsRes.data.data || []);

        // Approximate statistics
        const lost = allItems.filter((i) => i.type === 'LOST').length;
        const found = allItems.filter((i) => i.type === 'FOUND').length;
        setStats({
          totalItems: itemsRes.data.data?.pagination?.totalItems || allItems.length,
          lostCount: lost,
          foundCount: found,
        });
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/items');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-xl shadow-indigo-950/20 max-w-7xl mx-auto mt-4">
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI-Powered Lost & Found Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Lost Something? <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
              We Help You Find It.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            A production-ready platform connecting people who lost personal belongings with those who found them. Fast searches, verified claims, and AI semantic matching.
          </p>

          {/* Quick Search Box */}
          <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by keyword: 'Dell laptop', 'Keys', 'Blue backpack'..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-900 text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-400/50"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/report?type=LOST"
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition flex items-center space-x-1.5"
            >
              <span>Report Lost Item</span>
            </Link>
            <Link
              to="/report?type=FOUND"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition flex items-center space-x-1.5"
            >
              <span>Register Found Item</span>
            </Link>
            <Link
              to="/items"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs border border-white/20 transition flex items-center space-x-1.5"
            >
              <span>Browse All Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">How FindIt AI Works</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A three-step verification workflow designed to return items safely to their rightful owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Report Lost or Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide title, approximate date, campus location, and optional photo upload via Multer storage.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600">
              Instant MongoDB registration →
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Search & Match</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Search multi-field text indexes or let Google Gemini AI evaluate semantic similarity between lost and found descriptions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600">
              AI Semantic Matching →
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Claim & Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit confidential proof of ownership. Authorized administrators review and approve claims with recorded audit logs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-600">
              Secure Claim Workflow →
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Recent Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recently Reported Items</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore active items currently in the catalog</p>
          </div>
          <Link
            to="/items"
            className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading items...</div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onClaimClick={(it) => setClaimingItem(it)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 font-semibold">No items reported yet.</p>
            <Link
              to="/report"
              className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Report the First Item
            </Link>
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Browse by Category</h2>
          <p className="text-xs text-slate-500">Quickly jump into specific item categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/items?category=${cat._id}`}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition text-center group"
            >
              <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition block truncate">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Claim Modal if active */}
      {claimingItem && (
        <ClaimModal
          item={claimingItem}
          onClose={() => setClaimingItem(null)}
          onSuccess={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
}
