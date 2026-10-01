import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AiMatchModal from '../components/AiMatchModal';
import ClaimModal from '../components/ClaimModal';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Package, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function AiMatchHub() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimingItem, setClaimingItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await api.get('/items?limit=20&sort=newest');
        const list = res.data.data?.items || [];
        setItems(list);
        if (list.length > 0) setSelectedItem(list[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const [activeModalItem, setActiveModalItem] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-purple-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30 mb-4 backdrop-blur-xs">
            <Bot className="w-4 h-4 text-purple-300" />
            <span>Google Gemini 1.5 Flash Neural Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            AI Semantic Item Matching Lab
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm leading-relaxed mb-6">
            Traditional keyword search fails when people use different words (e.g. <em>"Samsung mobile"</em> vs <em>"Galaxy phone"</em>, or <em>"cracked screen"</em> vs <em>"damaged glass"</em>). Google Gemini AI analyzes the natural language meaning to surface hidden correlations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-purple-200 block text-[11px]">Reasoning Model</span>
              <strong className="text-white text-sm">Gemini 1.5 Flash</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-purple-200 block text-[11px]">API Security</span>
              <strong className="text-white text-sm">Zero Client Key Exposure</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-purple-200 block text-[11px]">Reliability</span>
              <strong className="text-white text-sm">Heuristic Fallback Engine</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Item Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select an Item to Run AI Matching</h2>
            <p className="text-xs text-slate-500">Pick any lost or found item from the catalog to trigger Gemini's semantic analysis</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            Loading catalog items...
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                        item.type === 'LOST' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{item.category?.name}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.location}
                  </span>
                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Run AI Match</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-xs text-slate-400">
            No items in catalog to test. Report some items first!
          </div>
        )}
      </div>

      {/* AI Architecture Explanation for Viva & Project Defense */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center">
          <HelpCircle className="w-4 h-4 mr-2 text-indigo-600" />
          Technical Explanation for Project Demonstration (Viva Questions)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 block font-bold">1. Zero API Key Exposure</strong>
            <p className="leading-relaxed text-slate-500">
              The Google Gemini API key is stored strictly on the Node.js backend in <code>server/.env</code>. The browser client communicates only with our Express endpoint (<code>POST /api/ai/match</code>).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 block font-bold">2. Enforced Structured JSON Schema</strong>
            <p className="leading-relaxed text-slate-500">
              We configure <code>responseMimeType: 'application/json'</code> in Gemini's generation config, guaranteeing deterministic JSON output containing confidence scores, match levels, and reasoning explanations.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 block font-bold">3. Intelligent Fallback Safety</strong>
            <p className="leading-relaxed text-slate-500">
              If the Gemini quota expires, internet drops, or no API key is supplied, our system automatically falls back to an intelligent heuristic token matcher without throwing an unhandled crash.
            </p>
          </div>
        </div>
      </div>

      {/* AI Match Modal */}
      {activeModalItem && (
        <AiMatchModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
          onClaimClick={(targetItem) => setClaimingItem(targetItem)}
        />
      )}

      {/* Claim Modal */}
      {claimingItem && (
        <ClaimModal
          item={claimingItem}
          onClose={() => setClaimingItem(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
