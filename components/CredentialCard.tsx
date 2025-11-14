
import React, { useState } from 'react';
import { Credential, Field, BundleField } from '../types';

interface CredentialCardProps {
  credential: Credential;
  onShare: () => void;
  onDelete: () => void;
  onAskAi: () => void;
  isSelectionMode?: boolean;
  onFieldSelect?: (field: Field, credentialInfo: {id: string, documentType: string}, isSelected: boolean) => void;
  selectedFields?: BundleField[];
  isRevoked?: boolean;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ 
    credential, 
    onShare, 
    onDelete, 
    onAskAi, 
    isSelectionMode = false, 
    onFieldSelect = () => {}, 
    selectedFields = [],
    isRevoked = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCheckboxChange = (field: Field, isChecked: boolean) => {
        onFieldSelect(field, { id: credential.id, documentType: credential.documentType }, isChecked);
    };
    
    const cardClasses = `bg-white border rounded-lg shadow-md overflow-hidden transition-all duration-300 flex flex-col relative
      ${isRevoked 
          ? 'border-red-300 bg-slate-50' 
          : 'border-amber-200/80 hover:border-red-800/50 hover:shadow-lg'}
      ${isSelectionMode && !isRevoked ? 'cursor-pointer' : ''}`;

  return (
    <div className={cardClasses}>
      {isRevoked && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold uppercase px-2 py-1 rounded-full z-10">
          Revoked
        </div>
      )}
      <div className={`p-5 flex-grow ${isRevoked ? 'opacity-60 grayscale' : ''}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-red-900">{credential.documentType}</h3>
                <p className="text-xs text-gray-500 font-mono">Issued: {new Date(credential.issuanceDate).toLocaleDateString()}</p>
            </div>
            {!isSelectionMode && (
                 <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                    {isExpanded ? <CollapseIcon/> : <ExpandIcon />}
                </button>
            )}
        </div>

        {(isExpanded || isSelectionMode) && (
            <div className="mt-4 pt-4 border-t border-amber-200 space-y-2 text-sm">
                {credential.fields.map(field => {
                  const isSelected = selectedFields.some(f => f.credentialId === credential.id && f.key === field.key);
                  return isSelectionMode ? (
                      <label key={field.key} className={`flex items-center p-2 rounded-md transition-colors ${isSelected ? 'bg-amber-100' : 'hover:bg-amber-50/50'}`}>
                          <input 
                              type="checkbox"
                              checked={isSelected}
                              disabled={isRevoked}
                              onChange={(e) => handleCheckboxChange(field, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-700"
                          />
                          <div className="ml-3 flex justify-between w-full">
                            <span className="text-gray-600">{field.key}:</span>
                            <span className="text-gray-800 font-mono">{field.value}</span>
                          </div>
                      </label>
                  ) : (
                    <div key={field.key} className="flex justify-between">
                        <span className="text-gray-500">{field.key}:</span>
                        <span className="text-gray-800 font-mono">{field.value}</span>
                    </div>
                  );
                })}
                 <p className="text-xs text-gray-400 pt-2">IPFS Hash: <span className="font-mono text-gray-500 break-all">{credential.ipfsHash}</span></p>
            </div>
        )}
      </div>
      {!isSelectionMode && (
          <div className="bg-amber-50/30 p-3 flex justify-end items-center space-x-2 border-t border-amber-200/80">
            <button onClick={onAskAi} disabled={isRevoked} className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-md hover:bg-amber-500 transition-colors flex items-center space-x-1.5 disabled:bg-slate-300 disabled:cursor-not-allowed">
              <SparkIcon />
              <span>Ask AI</span>
            </button>
            <button onClick={onShare} disabled={isRevoked} className="px-4 py-2 text-sm font-semibold bg-red-900 text-white rounded-md hover:bg-red-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
              Share
            </button>
            <button onClick={onDelete} className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 rounded-md hover:bg-red-500 hover:text-white transition-colors">
              Delete
            </button>
          </div>
      )}
    </div>
  );
};

const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const CollapseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

const SparkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);