import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Cpu,
  Bot
} from 'lucide-react';

export default function AiMatchModal({ item, onClose, onClaimClick }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const runAiMatching = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/match', { itemId: item._id });
      setAnalysisData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete AI matching analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAiMatching();
  }, [item._id]);

  const targetOpposite = item.type === 'LOST' ? 'FOUND' : 'LOST';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 text-base">Gemini AI Semantic Matcher</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    Gemini 1.5 Flash
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Scanning active {targetOpposite} items against "{item.title}"
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Engine Status Bar */}
          {analysisData && (
            <div className="mb-4 px-3.5 py-2 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs text-purple-900">
              <span className="flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                Active Engine: <strong className="ml-1 font-mono text-[11px]">{analysisData.engine}</strong>
              </span>
              <span className="text-[11px] text-purple-700 font-semibold">
                Evaluated {analysisData.totalEvaluated || 0} candidate items
              </span>
            </div>
          )}

          {/* Body Content */}
          <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-4">
            {loading ? (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="text-xs font-bold text-slate-700">Google Gemini is evaluating semantic similarity...</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Comparing synonyms, brand aliases, damage descriptions, locations, and incident dates.
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : analysisData?.matches?.length > 0 ? (
              <div className="space-y-3">
                {analysisData.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition shadow-xs space-y-3"
                  >
                    {/* Top Match Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            match.confidenceScore >= 70
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : match.confidenceScore >= 40
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {match.confidenceScore}% Similarity ({match.matchLevel} MATCH)
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Rank #{idx + 1}</span>
                      </div>

                      <span className="text-xs font-bold text-slate-800">
                        {match.item?.type}: {match.item?.title}
                      </span>
                    </div>

                    {/* Candidate Preview */}
                    <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {match.item?.image ? (
                          <img src={match.item.image} alt={match.item.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-600 line-clamp-2">{match.item?.description}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                            {match.item?.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                            {new Date(match.item?.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning Text */}
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 space-y-1.5">
                      <p className="font-bold flex items-center text-purple-900">
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                        Gemini AI Explanation:
                      </p>
                      <p className="leading-relaxed">{match.matchReason}</p>
                      {match.keySimilarities?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {match.keySimilarities.map((sim, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white text-purple-700 text-[10px] font-semibold border border-purple-200">
                              ✓ {sim}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <Link
                        to={`/items/${match.item?._id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-1"
                      >
                        <span>Inspect Item</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      {match.item?.type === 'FOUND' && match.item?.status !== 'CLAIMED' && onClaimClick && (
                        <button
                          onClick={() => {
                            onClose();
                            onClaimClick(match.item);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                        >
                          Claim This Item
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Bot className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No matching items identified by AI.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  None of the registered {targetOpposite} items shared enough semantic attributes with this report. Check back later as more items are reported!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Advisory tool only. Final claim approval rests with authorized campus staff.
          </span>
          <button
            onClick={runAiMatching}
            disabled={loading}
            className="text-indigo-600 hover:underline font-semibold"
          >
            Re-run Matcher
          </button>
        </div>
      </div>
    </div>
  );
}
