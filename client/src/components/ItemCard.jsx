import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Image as ImageIcon, Shield, ArrowRight } from 'lucide-react';

export default function ItemCard({ item, onClaimClick }) {
  const isFound = item.type === 'FOUND';

  const statusBadge = () => {
    switch (item.status) {
      case 'CLAIMED':
        return <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">CLAIMED</span>;
      case 'CLAIM_PENDING':
        return <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">CLAIM UNDER REVIEW</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">OPEN</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Thumbnail Header */}
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-10 h-10 stroke-1 mb-1" />
              <span className="text-xs">No Photo Provided</span>
            </div>
          )}

          {/* Type Badge Floating on Image */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5">
            <span
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs ${
                item.type === 'LOST'
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {item.type}
            </span>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
              {item.category?.name || 'General'}
            </span>
          </div>

          <div className="absolute top-3 right-3 shadow-xs">
            {statusBadge()}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <Link to={`/items/${item._id}`}>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mb-1.5">
              {item.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
            <div className="flex items-center text-slate-600">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center text-slate-400">
              <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-slate-50">
        <Link
          to={`/items/${item._id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {isFound && item.status !== 'CLAIMED' && onClaimClick && (
          <button
            onClick={() => onClaimClick(item)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
          >
            <Shield className="w-3 h-3 text-indigo-600" />
            <span>Claim</span>
          </button>
        )}
      </div>
    </div>
  );
}
