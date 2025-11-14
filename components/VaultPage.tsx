
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Credential, Bundle, BundleField, Page, Field, RevocationEntry } from '../types';
import { AddDocumentModal } from './AddDocumentModal';
import { ShareCredentialModal } from './ShareCredentialModal';
import { CredentialCard } from './CredentialCard';
import { AiChatModal } from './AiChatModal';

interface VaultPageProps {
  digitalId: string;
  setCurrentPage: (page: Page) => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({ digitalId, setCurrentPage }) => {
  const [credentials, setCredentials] = useLocalStorage<Credential[]>('credentials', []);
  const [bundles, setBundles] = useLocalStorage<Bundle[]>('bundles', []);
  const [revocationList] = useLocalStorage<RevocationEntry[]>('revocationList', []);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [sharingCredential, setSharingCredential] = useState<Credential | null>(null);
  const [chattingCredential, setChattingCredential] = useState<Credential | null>(null);

  // State for bundling
  const [isBundling, setIsBundling] = useState(false);
  const [selectedBundleFields, setSelectedBundleFields] = useState<BundleField[]>([]);
  const [bundleName, setBundleName] = useState('');

  const handleAddCredential = (newCredential: Credential) => {
    setCredentials(prev => [...prev, newCredential]);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  }
  
  const handleFieldSelect = (field: Field, credentialInfo: {id: string, documentType: string}, isSelected: boolean) => {
    setSelectedBundleFields(currentFields => {
      const fieldIndex = currentFields.findIndex(
        f => f.credentialId === credentialInfo.id && f.key === field.key
      );
      const fieldExists = fieldIndex !== -1;

      // If the field should be selected but isn't in the array yet
      if (isSelected && !fieldExists) {
        const newBundleField: BundleField = {
            credentialId: credentialInfo.id,
            credentialType: credentialInfo.documentType,
            key: field.key,
            value: field.value
        };
        return [...currentFields, newBundleField];
      }
      
      // If the field should NOT be selected but IS in the array
      if (!isSelected && fieldExists) {
        const updatedFields = [...currentFields];
        updatedFields.splice(fieldIndex, 1);
        return updatedFields;
      }

      // Otherwise, the state is already correct, return it as is
      return currentFields;
    });
  };
  
  const handleSaveBundle = () => {
    if (!bundleName.trim() || selectedBundleFields.length === 0) return;
    const newBundle: Bundle = {
        id: crypto.randomUUID(),
        name: bundleName,
        fields: selectedBundleFields,
    };
    setBundles(prev => [...prev, newBundle]);
    handleCancelBundle();
    setCurrentPage(Page.BUNDLES); // Navigate to bundles page after saving
  };
  
  const handleCancelBundle = () => {
    setIsBundling(false);
    setSelectedBundleFields([]);
    setBundleName('');
  };

  const truncatedId = `${digitalId.substring(0, 15)}...${digitalId.substring(digitalId.length - 8)}`;

  return (
    <div>
      <div className="mb-8 p-4 bg-white border border-amber-200/80 rounded-lg shadow-sm">
        <h2 className="text-sm text-slate-500 mb-1">Your Digital ID (Secret Key)</h2>
        <p className="text-lg font-mono text-red-900 break-all" title={digitalId}>{truncatedId}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Vault</h2>
        <div className="flex space-x-2">
            {!isBundling && (
                <button
                    onClick={() => setIsBundling(true)}
                    disabled={credentials.length === 0}
                    className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-400 transition-colors duration-200 flex items-center space-x-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                   <BundleIcon />
                   <span>Create Bundle</span>
                </button>
            )}
            <button
                onClick={() => setAddModalOpen(true)}
                className="px-5 py-2.5 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center space-x-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Document</span>
            </button>
        </div>
      </div>

      {isBundling && (
        <div className="sticky bottom-4 z-40 animate-fade-in-up">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-2xl border border-amber-200/80 flex items-center gap-4">
                <input 
                    type="text"
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                    placeholder="Enter Bundle Name (e.g., Job Application)"
                    className="w-full bg-amber-50 text-slate-900 p-3 rounded-md border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button onClick={handleSaveBundle} disabled={!bundleName.trim() || selectedBundleFields.length === 0} className="px-5 py-3 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-slate-300 whitespace-nowrap">
                   Save Bundle ({selectedBundleFields.length})
                </button>
                 <button onClick={handleCancelBundle} className="px-5 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300">
                   Cancel
                </button>
            </div>
        </div>
      )}

      {credentials.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-amber-300/80 rounded-lg bg-amber-50/30">
          <p className="text-slate-500">Your vault is empty.</p>
          <p className="text-slate-400">Click "Add Document" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map(cred => (
            <CredentialCard 
              key={cred.id} 
              credential={cred} 
              onShare={() => setSharingCredential(cred)}
              onDelete={() => handleDeleteCredential(cred.id)}
              onAskAi={() => setChattingCredential(cred)}
              isSelectionMode={isBundling}
              onFieldSelect={handleFieldSelect}
              selectedFields={selectedBundleFields}
              isRevoked={revocationList.some(r => r.credentialId === cred.id)}
            />
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddDocumentModal
          onClose={() => setAddModalOpen(false)}
          onAddCredential={handleAddCredential}
        />
      )}
      
      {sharingCredential && (
          <ShareCredentialModal
            credential={sharingCredential}
            digitalId={digitalId}
            onClose={() => setSharingCredential(null)}
          />
      )}

      {chattingCredential && (
        <AiChatModal 
          credential={chattingCredential}
          onClose={() => setChattingCredential(null)}
        />
      )}

    </div>
  );
};

const BundleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
    </svg>
)
