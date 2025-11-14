
import React, { useState } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { fileToBase64, fileToDataUrl } from '../utils/fileUtils';
import { Credential } from '../types';

interface AddDocumentModalProps {
  onClose: () => void;
  onAddCredential: (credential: Credential) => void;
}

enum Status {
  IDLE,
  UPLOADING,
  ANALYZING,
  DONE,
}

const statusMessages: Record<Status, string> = {
  [Status.IDLE]: "Select a document to upload",
  [Status.UPLOADING]: "Uploading to secure storage...",
  [Status.ANALYZING]: "Analyzing document with AI...",
  [Status.DONE]: "Credential issued successfully!",
};

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ onClose, onAddCredential }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setError(null);

    try {
      setStatus(Status.UPLOADING);
      const base64Image = await fileToBase64(file);
      const dataUrl = await fileToDataUrl(file);
      
      setStatus(Status.ANALYZING);
      const { documentType, fields } = await analyzeDocument(base64Image, file.type);
      
      const newCredential: Credential = {
        id: crypto.randomUUID(),
        documentType,
        issuer: "MySafePocket Issuer",
        issuanceDate: new Date().toISOString(),
        ipfsHash: `ipfs://${crypto.randomUUID()}${crypto.randomUUID()}`,
        fileDataUrl: dataUrl,
        fields,
      };
      
      setStatus(Status.DONE);
      onAddCredential(newCredential);
      
      setTimeout(onClose, 1000); // Close modal after success
    } catch (err) {
      console.error("Failed to add document:", err);
      setError("An unexpected error occurred. Please try again.");
      setStatus(Status.IDLE);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-amber-200/80">
        <div className="p-6 border-b border-amber-200/80 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add New Document</h2>
          <button onClick={onClose} disabled={status !== Status.IDLE && status !== Status.DONE} className="text-gray-500 hover:text-gray-900 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          {status === Status.IDLE ? (
            <>
              <label className="block mb-4 p-8 border-2 border-dashed border-amber-300/80 rounded-lg text-center cursor-pointer hover:border-red-900 hover:bg-amber-50/50 transition-colors">
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                <span className="text-gray-500">{file ? file.name : "Click to select an image"}</span>
              </label>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={!file}
                className="w-full py-3 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Issue Credential
              </button>
            </>
          ) : (
            <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                   <div className="w-16 h-16 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-lg text-gray-600">{statusMessages[status]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};