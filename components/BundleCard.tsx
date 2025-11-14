import React from 'react';
import { Bundle } from '../types';

interface BundleCardProps {
  bundle: Bundle;
  onShare: () => void;
  onDelete: () => void;
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, onShare, onDelete }) => {
  return (
    <div className="bg-white border border-amber-200/80 rounded-lg shadow-md overflow-hidden transition-all duration-300 flex flex-col hover:border-red-800/50 hover:shadow-lg">
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-red-900">{bundle.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{bundle.fields.length} field{bundle.fields.length !== 1 ? 's' : ''} included</p>

        <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2">
            {bundle.fields.map((field, index) => (
                <div key={`${field.credentialId}-${field.key}-${index}`} className="flex justify-between items-center text-sm bg-amber-50/60 p-2 rounded-md">
                    <div>
                        <span className="text-slate-500">{field.key}: </span>
                        <span className="font-mono text-slate-900">{field.value}</span>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap">{field.credentialType}</span>
                </div>
            ))}
        </div>
      </div>
      <div className="bg-amber-50/30 p-3 flex justify-end items-center space-x-2 border-t border-amber-200/80">
        <button onClick={onShare} className="px-4 py-2 text-sm font-semibold bg-red-900 text-white rounded-md hover:bg-red-800 transition-colors">
          Share
        </button>
        <button onClick={onDelete} className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 rounded-md hover:bg-red-500 hover:text-white transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
};
