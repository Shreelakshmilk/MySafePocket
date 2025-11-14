
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Field, RevocationEntry } from '../types';
import { verifySignature } from '../utils/fileUtils';
import useLocalStorage from '../hooks/useLocalStorage';

declare const jsQR: any;

interface VerificationResult {
  fields: (Field & {credentialType?: string})[];
  timestamp: string;
  sharedBy: string;
  documentType?: string; // For single credentials
  bundleName?: string; // For bundles
  credentialId?: string; // For single credentials
}

type VerificationStatus = 'pending' | 'verified' | 'failed';

export const VerifierPage: React.FC = () => {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // Get the revocation list from local storage
  const [revocationList] = useLocalStorage<RevocationEntry[]>('revocationList', []);

  const processQrData = async (data: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setStatus('pending');
    try {
      const parsedData = JSON.parse(data);
      const { signature, ...payload } = parsedData;

      if (payload && signature && payload.sharedBy && payload.fields && (payload.documentType || payload.bundleName)) {
        
        // --- REVOCATION CHECK ---
        let isRevoked = false;
        if (payload.credentialId) { // Single credential
            isRevoked = revocationList.some(r => r.credentialId === payload.credentialId);
        } else if (payload.bundleName) { // Bundle
            const credentialIdsInBundle = new Set(payload.fields.map((f: any) => f.credentialId));
            isRevoked = revocationList.some(r => credentialIdsInBundle.has(r.credentialId));
        }

        if (isRevoked) {
            setError("Verification Failed: This credential (or one in the bundle) has been revoked by the issuer.");
            setStatus('failed');
            setIsLoading(false);
            return;
        }

        // --- SIGNATURE VERIFICATION ---
        const dataToVerify = JSON.stringify(payload);
        const isValid = await verifySignature(dataToVerify, signature, payload.sharedBy);
        
        if (isValid) {
          setResult(payload);
          setStatus('verified');
        } else {
          setError("Tampering Detected! The signature is invalid.");
          setStatus('failed');
        }
      } else {
        setError("Invalid QR code format. Required signature or fields are missing.");
        setStatus('failed');
      }
    } catch (e) {
      setError("Failed to parse QR code data. It may not be a valid MySafePocket credential.");
      setStatus('failed');
    }
    setIsLoading(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setStatus('pending');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          await processQrData(code.data);
        } else {
          setError("No QR code found in the image. Please try another image.");
          setStatus('failed');
          setIsLoading(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                stopCamera();
                processQrData(code.data);
                return; 
            }
        }
    }
    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setResult(null);
    setError(null);
    setStatus('pending');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                setIsCameraOpen(true);
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", "true");
                videoRef.current.play();
                animationFrameId.current = requestAnimationFrame(scanFrame);
            }
        } catch (err) {
            setError("Could not access camera. Please ensure permissions are granted and try again.");
            setStatus('failed');
        }
    } else {
        setError("Your browser does not support camera access.");
        setStatus('failed');
    }
  };

  useEffect(() => {
    return () => stopCamera(); // Cleanup on unmount
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-2">QR Code Verifier</h2>
      <p className="text-slate-500 text-center mb-8">Upload an image or use your camera to scan a MySafePocket QR code and verify its contents.</p>

      <div className="bg-white border border-amber-200/80 rounded-lg p-8 flex flex-col items-center shadow-md">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <canvas ref={canvasRef} className="hidden"></canvas>

        {isCameraOpen ? (
          <div className="w-full aspect-square bg-slate-200 rounded-lg overflow-hidden relative mb-4 border border-slate-300">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-4 border-white/50 rounded-lg"></div>
            <button onClick={stopCamera} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full px-6 py-4 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                <UploadIcon />
                <span>Upload Image</span>
            </button>
            <button onClick={startCamera} disabled={isLoading} className="w-full px-6 py-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-400 transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                <CameraIcon />
                <span>Scan with Camera</span>
            </button>
          </div>
        )}

        {isLoading && (
            <div className="mt-6 flex items-center justify-center space-x-2 text-slate-600">
                <Spinner />
                <span>Processing...</span>
            </div>
        )}
        
        {status === 'failed' && error && !isLoading && (
            <div className="mt-6 w-full bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                    <CrossIcon />
                    <h3 className="text-xl font-bold text-red-700">Verification Failed</h3>
                </div>
                <p>{error}</p>
            </div>
        )}

        {status === 'verified' && result && (
            <div className="mt-6 w-full bg-green-50 border border-green-300 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                    <CheckIcon />
                    <h3 className="text-2xl font-bold text-green-700">Verified</h3>
                </div>
                 <h4 className="text-lg font-semibold text-slate-800 mb-3">{result.bundleName || result.documentType}</h4>
                 <div className="space-y-2 border-t border-green-200 pt-3">
                    {result.fields.map(field => (
                        <div key={field.key} className="flex justify-between items-center text-sm">
                           <div>
                             <span className="text-slate-500">{field.key}: </span>
                             <span className="font-mono text-slate-900">{field.value}</span>
                           </div>
                           {result.bundleName && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{field.credentialType}</span>}
                        </div>
                    ))}
                 </div>
                 <div className="mt-4 pt-3 border-t border-green-200 text-xs text-slate-400">
                    <p>Shared By: <span className="font-mono text-slate-500">{result.sharedBy}</span></p>
                    <p>Timestamp: <span className="font-mono text-slate-500">{new Date(result.timestamp).toLocaleString()}</span></p>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};


const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13h-2.5z" />
        <path d="M3.5 14a1 1 0 00-1 1v1a1 1 0 001 1h13a1 1 0 001-1v-1a1 1 0 00-1-1H3.5z" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm10 4a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const CrossIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);