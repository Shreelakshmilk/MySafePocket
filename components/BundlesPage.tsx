import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Bundle, Page } from '../types';
import { BundleCard } from './BundleCard';
import { ShareBundleModal } from './ShareBundleModal';

interface BundlesPageProps {
  digitalId: string;
  setCurrentPage: (page: Page) => void;
}

export const BundlesPage: React.FC<BundlesPageProps> = ({ digitalId, setCurrentPage }) => {
  const [bundles, setBundles] = useLocalStorage<Bundle[]>('bundles', []);
  const [sharingBundle, setSharingBundle] = useState<Bundle | null>(null);

  const handleDeleteBundle = (id: string) => {
    setBundles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Credential Bundles</h2>
        <button
            onClick={() => setCurrentPage(Page.VAULT)}
            className="px-5 py-2.5 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Create New Bundle</span>
        </button>
      </div>
      <p className="text-slate-500 mb-8">Bundles allow you to share specific pieces of information from multiple documents at once.</p>

      {bundles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-amber-300/80 rounded-lg bg-amber-50/30">
          <p className="text-slate-500">You haven't created any bundles yet.</p>
          <p className="text-slate-400">Go to "My Vault" to create your first bundle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map(bundle => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onShare={() => setSharingBundle(bundle)}
              onDelete={() => handleDeleteBundle(bundle.id)}
            />
          ))}
        </div>
      )}

      {sharingBundle && (
        <ShareBundleModal
          bundle={sharingBundle}
          digitalId={digitalId}
          onClose={() => setSharingBundle(null)}
        />
      )}
    </div>
  );
};
