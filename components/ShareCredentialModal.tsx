
import React, { useState, useEffect, useRef } from 'react';
import { Credential } from '../types';
import { createSignature, dataUrlToBlob } from '../utils/fileUtils';

declare const QRCode: any;

interface ShareCredentialModalProps {
  credential: Credential;
  digitalId: string;
  onClose: () => void;
}

export const ShareCredentialModal: React.FC<ShareCredentialModalProps> = ({ credential, digitalId, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initially select all fields
    const allFields = credential.fields.reduce((acc, field) => {
      acc[field.key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedFields(allFields);
  }, [credential]);

  const handleFieldToggle = (key: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGenerateQr = async () => {
    const payload = {
      credentialId: credential.id, // Add credentialId to payload for revocation check
      documentType: credential.documentType,
      sharedBy: digitalId,
      timestamp: new Date().toISOString(),
      fields: credential.fields.filter(field => selectedFields[field.key]),
    };

    const signature = await createSignature(JSON.stringify(payload), digitalId);
    const dataToShare = { ...payload, signature };

    setShowQr(true);

    setTimeout(() => {
        if (qrCodeRef.current) {
            qrCodeRef.current.innerHTML = ''; // Clear previous QR code
            new QRCode(qrCodeRef.current, {
              text: JSON.stringify(dataToShare),
              width: 256,
              height: 256,
              colorDark: "#111827",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.M
            });
            
            // Extract data URL from canvas for sharing/downloading
            const canvas = qrCodeRef.current.querySelector('canvas');
            if (canvas) {
                setQrDataUrl(canvas.toDataURL('image/png'));
            }
          }
    }, 100);
  };
  
  const handleDownload = () => {
      if (!qrDataUrl) return;
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `MySafePocket-QR-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleShare = async () => {
      if (!qrDataUrl || !navigator.share) return;
      try {
        const blob = await dataUrlToBlob(qrDataUrl);
        const file = new File([blob], `MySafePocket-QR-${Date.now()}.png`, { type: 'image/png' });
        await navigator.share({
            title: 'MySafePocket Credential',
            text: `Here is my verified information from MySafePocket.`,
            files: [file]
        });
      } catch (error) {
          console.error('Error sharing:', error);
      }
  };

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-amber-200/80">
        <div className="p-6 border-b border-amber-200/80 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Share Credential</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {!showQr ? (
            <>
              <p className="text-gray-500 mb-1">Select the fields you want to share from:</p>
              <h3 className="text-lg font-bold text-red-900 mb-4">{credential.documentType}</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-6">
                {credential.fields.map(field => (
                  <label key={field.key} className="flex items-center bg-amber-50/60 p-3 rounded-md cursor-pointer hover:bg-amber-100/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!selectedFields[field.key]}
                      onChange={() => handleFieldToggle(field.key)}
                      className="h-5 w-5 rounded bg-white border-gray-300 text-red-900 focus:ring-red-800"
                    />
                    <span className="ml-3 text-gray-800">{field.key}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleGenerateQr}
                disabled={selectedCount === 0}
                className="w-full py-3 px-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Generate Secure QR Code ({selectedCount} fields)
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center">
                <p className="text-gray-500 mb-4 text-center">Scan this QR code to verify the selected information.</p>
                <div ref={qrCodeRef} className="p-4 bg-white rounded-lg border border-amber-200/80 shadow-sm"></div>
                
                {qrDataUrl && (
                    <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
                       {navigator.share && (
                         <button onClick={handleShare} className="flex-1 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors flex items-center justify-center space-x-2">
                            <ShareIcon/> <span>Share</span>
                         </button>
                       )}
                        <button onClick={handleDownload} className="flex-1 px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2">
                           <DownloadIcon/> <span>Download</span>
                        </button>
                    </div>
                )}

                <button
                    onClick={() => { setShowQr(false); setQrDataUrl(null); }}
                    className="mt-6 text-sm text-red-900 hover:underline"
                >
                    &larr; Back to field selection
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);